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

// Pass a Petal request from a website to the Petal dev server
// Check the OAuth flow: 
//   1. The returned user code
//   2. The token
//   3. The error when the user does not authenticate
//   4. The error when the token request fails
// Edit the page and publish the changes as a PR:
//   1. Edit the page
//   2. Download the document to compare it later with the PR
//   3. Click the publish button
//   4. Fill the PR dialog
//   5. Click the OK button
//   6. Check the status message
// Compare the downloaded document with the PR document from the reuturned PR URL

const frontendHost = 'pineapple.evolvedbinary.com';
const frontendUrl: string = 'http://' + frontendHost + '/';
const backendHost = 'localhost:3000'
const apiUrl: string = 'http://' + backendHost + '/';
const ghrepo: string = 'evolvedbinary/cityehr-documentation';
const source: string = 'cityehr-quick-start-guide/src/main/lwdita/quickstart-guide-modular/verify-install.dita';
const branch: string = 'develop';
const referer: string = 'https://evolvedbinary.github.io/cityehr-documentation/verify-install.html'; 
const testParameters: string = `?ghrepo=${ghrepo}&source=${source}&branch=${branch}&referer=${referer}`;
const stateParam: string = 'eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L2NpdHllaHItZG9jdW1lbnRhdGlvbiIsInNvdXJjZSI6ImNpdHllaHItcXVpY2stc3RhcnQtZ3VpZGUvc3JjL21haW4vbHdkaXRhL3F1aWNrc3RhcnQtZ3VpZGUtbW9kdWxhci92ZXJpZnktaW5zdGFsbC5kaXRhIiwiYnJhbmNoIjoiZGV2ZWxvcCIsInJlZmVyZXIiOiJodHRwczovL2V2b2x2ZWRiaW5hcnkuZ2l0aHViLmlvL2NpdHllaHItZG9jdW1lbnRhdGlvbi92ZXJpZnktaW5zdGFsbC5odG1sIn0%3D';
const tokenRequest = new RegExp(`http://${backendHost}/api/github/token\\?.*`);

describe('A request to GitHub OAuth', () => {
  it('redirects to the GitHub app authentication', () => {
    cy.visit(frontendUrl + testParameters)
    cy.window().then((win) => {
      cy.stub(win.location, 'href').callsFake((url) => {
        expect(url).to.include('https://github.com/login/oauth/authorize');
      });
    });
  });
});

describe('The Github Oauth response', () => {
  it('returns a user code when authenticated', () => {
    const mockCode = 'mock-user-code';

    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token'
      }
    }).as('requestToken');

    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + `?code=${mockCode}` }
    }).as('githubOAuth');

    // Visit the app page where the OAuth flow starts
    cy.visit(frontendUrl + testParameters);

    // Wait for the interception to occur
    cy.wait('@githubOAuth');
    cy.wait('@requestToken');

    // Verify that the mocked redirect URL is correct
    cy.url().should('eq', frontendUrl + `?code=${mockCode}`);
  });

  it('returns an error when user does not authenticate', () => {
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + '?error=not-authenticated' }
    }).as('githubOAuth');

    // Visit the app page where the OAuth flow starts
    cy.visit(frontendUrl + testParameters);

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    // Verify that the error page is shown
    const errorParam = new RegExp(`^${frontendUrl}/error\\.html\\?error=not-authenticated$`);
    cy.url().should('match', errorParam);
  });
});

describe('An OAuth request', () => {
  it('requests a token from the server', () => {
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + `?code=${mockCode}&state=`+ stateParam }
    }).as('githubOAuth');

    // Intercept the token request
    //const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token'
      }
    }).as('requestToken');

    // Visit the app page where the OAuth flow starts
    cy.visit(frontendUrl + testParameters);

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    // Verify that the mocked redirect URL is correct
    cy.url().should('eq', frontendUrl + `?code=${mockCode}&state=` + stateParam);
    cy.wait('@requestToken');

    // Verify that the token request was made
    cy.get('@requestToken').should('have.property', 'response');
    cy.get('@requestToken').its('response.statusCode').should('eq', 200);

    cy.getAllLocalStorage().then((result) => {
      expect(result[frontendUrl]).to.have.property('token');
    })
  });

  it('shows an error when the token request fails', () => {
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    const mockCode = 'mock-user-code';

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + `?code=${mockCode}&state=` + stateParam }
    }).as('githubOAuth');

    cy.intercept('GET', tokenRequest, {
      statusCode: 401,
      headers: { 'content-type': 'application/json' },
      body: 'Unauthorized'
    }).as('requestToken');

    // Visit the app page where the OAuth flow starts
    cy.visit(frontendUrl + testParameters);

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    cy.wait('@requestToken');
    // Verify that the token request was made
    cy.get('@requestToken').should('have.property', 'response');
    cy.get('@requestToken').its('response.statusCode').should('eq', 401);


    // Verify that the error page is shown
    cy.url().should('match', /^http:\/\/localhost:1234\/error\.html\?/)
  });

  it('asks the user to install the app when token request returns "not installed"', () => {
    const mockCode = 'mock-user-code';
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + `?code=${mockCode}&state=` + stateParam }
    }).as('githubOAuth');

    // Intercept the token request
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token',
        installation: false
      }
    }).as('requestToken');

    // Visit the app page where the OAuth flow starts
    cy.visit(frontendUrl + testParameters);

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    // Verify that the mocked redirect URL is correct
    cy.url().should('eq', frontendUrl + `?code=${mockCode}&state=` + stateParam);

    cy.wait('@requestToken');
    
    // assert the user was redirected to the installation page
    // github.com/apps/petal-demo/installations/new
    cy.url().should('include', 'integration=petal-demo');
  });
});

describe('The publish button', () => {
  it('will not be rendered when no params are sent', () => {
    cy.visit(frontendUrl);
    cy.get('#publishFile').should('not.exist');
  });

  it('will be rendered if params are sent params', () => {
    // mock the GitHub OAuth URL
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + `?code=${mockCode}&state=` + stateParam }
    }).as('githubOAuth');

    // Intercept the token request
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token',
        installation: true
      }
    }).as('requestToken');

    cy.visit(frontendUrl + testParameters);
    cy.get('#publishFile').should('exist');
  });
});

describe('Saving the edits by clicking the publish button', () => {

  beforeEach(() => {
    // mock the GitHub OAuth URL
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: frontendUrl + `?code=${mockCode}&state=` + stateParam }
    }).as('githubOAuth');

    // Intercept the token request  
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token',
        installation: true
      }
    }).as('requestToken');
    cy.visit(frontendUrl + testParameters);
    cy.get('body > div.toastify.on.toast.toast__panel.toast--welcome.toastify-right.toastify-top > section > button').click();
  })

  it('will open a PR dialog when the publish button is clicked', () => {
    cy.get('#publishFile').click();
    cy.get('#prDialog').should('exist');
  });

  it('will provide a PR dialog that can be closed with a button click', () => {
    cy.get('#publishFile').click();
    cy.get('#closeButton').click();
    cy.get('#prDialog').should('not.exist');
  });

  it('will provide a PR dialog with title input for the PR description', () => {
    cy.get('#publishFile').click();
    cy.get('#okButton').click();
    cy.focused().should('have.attr', 'id', 'titleInput');
  });

  it('will result in showing a success message when the PR is created', () => {
    // mock the user data request
    const url = apiUrl + `api/github/user`;
    cy.intercept('GET', url, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        login: 'mock-user'
      }
    }).as('getUserInfo');

    // Intercept the PR request
    const prRequest = apiUrl + `api/github/integration`;
    cy.intercept('POST', prRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        url: 'http-pr-url'
      }
    }).as('prRequest');

    cy.get('#publishFile').click();
    cy.get('#titleInput').type('mock-title');
    cy.get('#descField').type('mock-description');
    cy.get('#okButton').click();

    // Wait for the requests to complete
    cy.wait('@getUserInfo');
    cy.wait('@prRequest');

    cy.get('body > div.toastify.on.toast__panel.toast--success.toastify-right.toastify-top > section').should('exist');
  });

  it('will result in shhowing an error message when the PR request fails', () => {
    // mock the user data request
    const url = apiUrl + `api/github/user`;
    cy.intercept('GET', url, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        login: 'mock-user'
      }
    }).as('getUserInfo');

    // Intercept the PR request
    const prRequest = apiUrl + `api/github/integration`;
    cy.intercept('POST', prRequest, {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: 'Internal server error'
    }).as('prRequest');

    cy.get('#publishFile').click();
    cy.get('#titleInput').type('mock-title');
    cy.get('#descField').type('mock-description');
    cy.get('#okButton').click();

    // Wait for the requests to complete
    cy.wait('@getUserInfo');
    cy.wait('@prRequest');

    cy.get('body > div.toastify.on.toast__panel.toast--error.toastify-right.toastify-top > section').should('exist');
  });

});
