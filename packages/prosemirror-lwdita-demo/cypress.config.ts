import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    chromeWebSecurity: false // https://docs.cypress.io/guides/guides/web-security#Set-chromeWebSecurity-to-false

  },
  trashAssetsBeforeRuns: true,
});
