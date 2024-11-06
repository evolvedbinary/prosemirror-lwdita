/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

module.exports = {
    name: `plugin-addition`,
    factory: require => {
      const {BaseCommand, WorkspaceRequiredError} = require("@yarnpkg/cli");
      const {Configuration, Project} = require("@yarnpkg/core");
      const {execute} = require("@yarnpkg/shell");
      const {Command, Option} = require("clipanion");
      const {access, copyFile, rm} = require("fs/promises");
      const t = require("typanion");

      const semver2Regex = "(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:\\-([1-9A-Za-z-][0-9A-Za-z-]*(?:\\.[1-9A-Za-z-][0-9A-Za-z-]*)*))?(?:\\+([1-9A-Za-z-][0-9A-Za-z-]*(?:\\.[1-9A-Za-z-][0-9A-Za-z-]*)*))?";
      const yarnAutoVersionsRegex = "(major|minor|patch)";
  
      class ReleaseCommand extends BaseCommand {
        static paths = [[`release`]];
  
        // Show descriptive usage for a --help argument passed to this command
        static usage = Command.Usage({
          description: `Publish a new release`,
          details: `
            This command will create a new release for the project, which involves the following steps:
            1. Check project status - Requires no unstaged changes, and no un-pushed commits.
            2. Pre-release testing - Executes the \`lint\` and \`test\` scripts.
            3. Update the version numbers of all packages.
            4. git commit the version update.
            5. git tag and sign the release tag.
            6. git push the updates - Version commit and tag.
            7. Publish the packages to npm.js.
          `,
          examples: [
            [
                `Release the next major version`,
                `yarn release major`,
            ],
            [
                `Release the next version as 2.1.0`,
                `yarn release 2.1.0`,
            ]
        ],
        });
  
        version = Option.String({
            validator: t.matchesRegExp(new RegExp("^" + yarnAutoVersionsRegex + "|(?:" + semver2Regex + ")$"))
        });
        // b = Option.String({validator: t.isNumber()});
  
        async execute() {
          const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
          const {project, workspace} = await Project.find(configuration, this.context.cwd);

          if (!workspace) {
            throw new WorkspaceRequiredError(project.cwd, this.context.cwd);
          }

          // process exit code for the last command
          let exitCode = 0;

          this.context.stdout.write(`Preparing to release version: ${this.version}...\n`);

          const executeOptions = {"cwd": project.cwd};

          // Step 1 - Check project status - requires no unstaged changes, and no un-pushed commits
          // TODO(AR) figure out how to capture stdout from the git commands below and check the content
          this.context.stdout.write("1. Checking project status...\n");
          this.context.stdout.write("1.1. Checking for git 'main' branch...\n");
          //   await execute('git', ['branch', '--show-current'], executeOptions);
          this.context.stdout.write("1.2. Checking for unstaged changes...\n");
          //   await execute('git', ['status', '--porcelain', '--untracked-files=no'], executeOptions);
          this.context.stdout.write("1.3. Checking for un-pushed commits...\n");
          //   await execute('git', ['log', 'origin/main..HEAD'], [], executeOptions);

          // Step 2 - Pre-release testing - Executes the `lint` and `test` scripts
          this.context.stdout.write("2. Performing pre-release testing...\n");
          exitCode = await this.cli.run(["clean"]);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: 'yarn clean' failed with code: ${exitCode}\n`);
            return;
          }
          this.context.stdout.write("2.1. Performing build...\n");
          exitCode = await this.cli.run(["build"]);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: 'yarn build' failed with code: ${exitCode}\n`);
            return;
          }
          this.context.stdout.write("2.2. Performing lint...\n");
          exitCode = await this.cli.run(["lint"]);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: 'yarn lint' failed with code: ${exitCode}\n`);
            return;
          }
          // this.context.stdout.write("2.3. Running tests...\n");
          exitCode = await this.cli.run(["test"]);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: 'yarn test' failed with code: ${exitCode}\n`);
            return;
          }

          // Cleanup after Step 2 - Pre-release testing
          exitCode = await this.cli.run(["clean"]);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: 'yarn clean' failed with code: ${exitCode}\n`);
            return;
          }

          // Step 3 - Increment the versions of all packages (including the project root)
          let packageFiles = [];
          this.context.stdout.write(`3. Running \`yarn version\` to bump versions of all workspaces to ${this.version}...\n`);
          for (let i = 0; i < project.workspaces.length; i++) {
            const projectWorkspace = project.workspaces[i];

            if (projectWorkspace.cwd == project.cwd) {
              exitCode = await this.cli.run(["version", this.version]);
              if (exitCode !== 0) {
                this.context.stderr.write(`Error: Incrementing project version failed with code: ${exitCode}\n`);
                return;
              }
            } else {
              const projectWorkspaceName = `@${projectWorkspace.manifest.name.scope}/${projectWorkspace.manifest.name.name}`;
              exitCode = await this.cli.run(["workspace", projectWorkspaceName, "version", this.version]);
              if (exitCode !== 0) {
                this.context.stderr.write(`Error: Incrementing workspace '` + projectWorkspaceName + `' version failed with code: ${exitCode}\n`);
                return;
              }
            }
            packageFiles.push(`${projectWorkspace.cwd}/package.json`);
          }

          // Step 4 - git commit the version update.
          this.context.stdout.write("4. git Committing the version update...\n");
          exitCode = await execute("git", ["commit", `--message=[release] Release version: ${this.version}`].concat(packageFiles), executeOptions);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: git commit failed with code: ${exitCode}\n`);
            return;
          } else {
            this.context.stdout.write("git commit OK!\n");
          } 

          // Step 5 - git tag and sign the release tag.
          this.context.stdout.write("5. git Committing the version update...\n");
          exitCode = await execute("git", ["tag", `--message=[release] Release version: ${this.version}`, "--sign", `v${this.version}`], executeOptions);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: git commit failed with code: ${exitCode}\n`);
            return;
          } else {
            this.context.stdout.write("git tag OK!\n");
          } 
          // Step 6 - git push the updates.
          this.context.stdout.write("6. git push the version update...\n");
          this.context.stdout.write("6.1. git pushing the branch...\n");
          exitCode = await execute("git", ["push"], executeOptions);
          if (exitCode !== 0) {
            this.context.stderr.write(`Error: git push failed with code: ${exitCode}\n`)
            return;
          } else {
            this.context.stdout.write("git push OK!\n");
          } 
          this.context.stdout.write("6.2. git pushing the tag...\n");
          exitCode = await execute("git", ["push", "--tags"], executeOptions);
          if (exitCode !== 0) {
            this.context.stderr.write("Error: git push tags failed with code: ${exitCode}\n");
            return;
          } else {
            this.context.stdout.write("git push tags OK!\n");
          } 
          // Step 7 - Publish the packages to npm.js.
          this.context.stdout.write("7. Running `yarn npn publish` to publish packages to npm.js...\n");
          exitCode = await this.cli.run(["npm", "login"]);
          if (exitCode !== 0) {
            this.context.stderr.write("Error: npm login failed with code: ${exitCode}\n");
            return;
          } else {
            this.context.stdout.write("npm login OK!\n");
          }
          for (let i = 0; i < project.workspaces.length; i++) {
            const projectWorkspace = project.workspaces[i];

            if (projectWorkspace.cwd == project.cwd) {
              this.context.stdout.write("NOTE: Skipping publish of project root workspace!\n")
            } else {
              const projectWorkspaceName = `@${projectWorkspace.manifest.name.scope}/${projectWorkspace.manifest.name.name}`;

              const licenseFileExists = await access(`${projectWorkspace.cwd}/LICENSE`).then(_x => true).catch(_e => false);
              let copiedLicenseFile = false;
              if (!licenseFileExists) {
                // Make a copy of the LICENSE file to the workspace so that it is published as part of the package
                try {
                  await copyFile(`${project.cwd}/LICENSE`, `${projectWorkspace.cwd}/LICENSE`);
                  copiedLicenseFile = true;
                } catch(error) {
                  this.context.stderr.write(`Error: Copying LICENSE to workspace '` + projectWorkspaceName+ `' failed: ${error}\n`);
                  return;
                }
              }
              // Publish the workspace package
              exitCode = await this.cli.run(["workspace", projectWorkspaceName, "npm", "publish", "--access", "public"]);
              if (exitCode !== 0) {
                this.context.stderr.write(`Error: npm publish '` + projectWorkspaceName + `' failed with code: ${exitCode}\n`);
                return;
              } else {
                this.context.stdout.write(`npm publish '` + projectWorkspaceName + `' OK!\n`);
              }

              if (copiedLicenseFile) {
                // Remove the copy of the LICENSE file from the workspace
                try {
                  await rm(`${projectWorkspace.cwd}/LICENSE`);
                } catch(error) {
                  this.context.stderr.write(`Error: Removing LICENSE from workspace '` + projectWorkspaceName+ `' failed: ${error}\n`);
                  return;
                }
              }
            }
          }

          this.context.stdout.write(`Released version: ${this.version} OK!\n`);
        }

        async catch(error) {
          throw error;
        }
      }
  
      return {
        commands: [
          ReleaseCommand,
        ],
      };
    },
  };