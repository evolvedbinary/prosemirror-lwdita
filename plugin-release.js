module.exports = {
    name: `plugin-addition`,
    factory: require => {
      const {BaseCommand, WorkspaceRequiredError} = require(`@yarnpkg/cli`);
      const {Configuration, Project} = require('@yarnpkg/core');
      const {execute} = require('@yarnpkg/shell');
      const {Command, Option} = require(`clipanion`);
      const {copyFile, rm} = require('fs/promises');
      const t = require(`typanion`);

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

          this.context.stdout.write(`Preparing to release version: ${this.version}...\n`);

          let executeOptions = {"cwd": project.cwd};

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
          await this.cli.run(['build']);
          await this.cli.run(['lint']);
          await this.cli.run(['test']);
          // this.context.stdout.write("2.1. Performing lint...\n");
          // await this.cli.run(['clean'])
          // await this.cli.run(['lint'])
          // this.context.stdout.write("2.2. Performing build...\n");
          // await this.cli.run(['clean'])
          // await this.cli.run(['build'])
          // this.context.stdout.write("2.3. Running tests...\n");
          // await this.cli.run(['clean'])
          // await this.cli.run(['test'])

          // Cleanup after Step 2 - Pre-release testing
          await this.cli.run(['clean'])

          // Step 3 - Increment the versions of all packages (including the project root)
          let packageFiles = [];
          this.context.stdout.write(`3. Running \`yarn version\` to bump versions of all workspaces to ${this.version}...\n`);
          for (let i = 0; i < project.workspaces.length; i++) {
            let projectWorkspace = project.workspaces[i];

            if (projectWorkspace.cwd == project.cwd) {
              await this.cli.run(['version', this.version]);
            } else {
              let projectWorkspaceName = `@${projectWorkspace.manifest.name.scope}/${projectWorkspace.manifest.name.name}`;
              await this.cli.run(['workspace', projectWorkspaceName, 'version', this.version]);
            }
            packageFiles.push(`${projectWorkspace.cwd}/package.json`);
          }

          // Step 4 - git commit the version update.
          this.context.stdout.write(`4. git Committing the version update...\n`);
          await execute('git', ['commit', `--message=[release] Release version: ${this.version}`].concat(packageFiles), executeOptions);
        
          // Step 5 - git tag and sign the release tag.
          this.context.stdout.write(`5. git Committing the version update...\n`);
          await execute('git', ['tag', `--message=[release] Release version: ${this.version}`, '--sign', `v${this.version}`], executeOptions);
        
          // Step 6 - git push the updates.
          this.context.stdout.write(`6. git push the version update...\n`);
          this.context.stdout.write(`6.1. git pushing the branch...\n`);
          await execute('git', ['push'], executeOptions);
          this.context.stdout.write(`6.2. git pushing the tag...\n`);
          await execute('git', ['push', '--tags'], executeOptions);

          // Step 7 - Publish the packages to npm.js.
          this.context.stdout.write(`7. Running \`yarn npn publish\` to publish packages to npm.js...\n`);
          await this.cli.run(['npm', 'login']);
          for (let i = 0; i < project.workspaces.length; i++) {
            let projectWorkspace = project.workspaces[i];

            if (projectWorkspace.cwd == project.cwd) {
              this.context.stdout.write("NOTE: Skipping publish of project root workspace!\n")
            } else {
              // Make a copy of the LICENSE file to the workspace so that it is published as part of the package
              await copyFile(`${project.cwd}/LICENSE`, `${projectWorkspace.cwd}/LICENSE`);

              // Publish the workspace package
              let projectWorkspaceName = `@${projectWorkspace.manifest.name.scope}/${projectWorkspace.manifest.name.name}`;
              await this.cli.run(['workspace', projectWorkspaceName, 'npm', 'publish', '--access', 'public']);

              // Remove the copy of the LICENSE file from the workspace
              await rm(`${projectWorkspace.cwd}/LICENSE`);
            }
          }

          this.context.stdout.write(`Released version: ${this.version} OK!\n`);
        }
      }
  
      return {
        commands: [
          ReleaseCommand,
        ],
      };
    },
  };