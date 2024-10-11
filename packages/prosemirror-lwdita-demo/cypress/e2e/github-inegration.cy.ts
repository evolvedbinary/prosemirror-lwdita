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

describe('redirect to gitHub', () => {
  it('should not redirect to GitHub app authentication', () => {
    cy.visit('http://localhost:1234/')
    cy.url().should('not.include', 'github.com/login/oauth/authorize');
  });

  it('should redirect to GitHub app authentication', () => {

    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/')

    cy.window().then((win) => {
      cy.stub(win.location, 'href').callsFake((url) => {
        expect(url).to.include('https://github.com/login/oauth/authorize');
      });
    });
  });
});

// FIXME: This test is not working due to a bug in processRequest() and handling the error code after GitHub authentication failed
describe.skip('handle Github Oauth response', () => {
  it('should return a user code when authenticated', () => {
    const mockCode = 'mock-user-code';

    const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
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
      headers: { location: `http://localhost:1234/?code=${mockCode}` }
    }).as('githubOAuth');

    // Visit the app page where the OAuth flow starts
    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');

    // Wait for the interception to occur
    cy.wait('@githubOAuth');
    cy.wait('@requestToken');

    // Verify that the mocked redirect URL is correct
    cy.url().should('eq', `http://localhost:1234/?code=${mockCode}`);
  });

  it('should return a error when user does not authenticate', () => {
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: 'http://localhost:1234/?error=not-authenticated' }
    }).as('githubOAuth');

    // Visit the app page where the OAuth flow starts
    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    // Verify that the error page is shown
    cy.url().should('match', /^http:\/\/localhost:1234\/error\.html\?/)
  });
});

describe('request the token after OAuth', () => {
  it('should request a token from the server', () => {
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9` }
    }).as('githubOAuth');

    // Intercept the token request
    const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token'
      }
    }).as('requestToken');

    // Visit the app page where the OAuth flow starts
    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    // Verify that the mocked redirect URL is correct
    cy.url().should('eq', `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9`);


    cy.wait('@requestToken');

    // Verify that the token request was made
    cy.get('@requestToken').should('have.property', 'response');
    cy.get('@requestToken').its('response.statusCode').should('eq', 200);

    cy.getAllLocalStorage().then((result) => {
      expect(result['http://localhost:1234']).to.have.property('token');
    })
  });

  it('should show an error when the token request fails', () => {
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    const mockCode = 'mock-user-code';

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9` }
    }).as('githubOAuth');

    const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
    cy.intercept('GET', tokenRequest, {
      statusCode: 401,
      headers: { 'content-type': 'application/json' },
      body: 'Unauthorized'
    }).as('requestToken');

    // Visit the app page where the OAuth flow starts
    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    cy.wait('@requestToken');
    // Verify that the token request was made
    cy.get('@requestToken').should('have.property', 'response');
    cy.get('@requestToken').its('response.statusCode').should('eq', 401);


    // Verify that the error page is shown
    cy.url().should('match', /^http:\/\/localhost:1234\/error\.html\?/)
  });

  it('should ask the user to install the app when token request returns not installed', () => {
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9` }
    }).as('githubOAuth');

    // Intercept the token request
    const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token',
        installation: false
      }
    }).as('requestToken');

    // Visit the app page where the OAuth flow starts
    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');

    // Wait for the interception to occur
    cy.wait('@githubOAuth');

    // Verify that the mocked redirect URL is correct
    cy.url().should('eq', `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9`);

    cy.wait('@requestToken');
    
    // assert the user was redirected to the installation page
    // github.com/apps/petal-demo/installations/new
    cy.url().should('include', 'integration=petal-demo');
  });
});

describe('render publish button', () => {
  it('should not render the publish button when no params', () => {
    cy.visit('http://localhost:1234/');
    cy.get('#publishFile').should('not.exist');
  });

  it('should render the publish button when params', () => {
    // mock the GitHub OAuth URL
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9` }
    }).as('githubOAuth');

    // Intercept the token request
    const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token',
        installation: true
      }
    }).as('requestToken');

    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');
    cy.get('#publishFile').should('exist');
  });
});

describe('PR dialog', () => {

  beforeEach(() => {
    // mock the GitHub OAuth URL
    const mockCode = 'mock-user-code';
    // Intercept the GitHub OAuth URL
    const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;

    // Intercept the OAuth request and mock the authentication process
    cy.intercept('GET', githubOAuthUrl, {
      statusCode: 302,
      headers: { location: `http://localhost:1234/?code=${mockCode}&state=eyJnaHJlcG8iOiJldm9sdmVkYmluYXJ5L3Byb3NlbWlycm9yLWx3ZGl0YSIsInNvdXJjZSI6InBhY2thZ2VzL3Byb3NlbWlycm9yLWx3ZGl0YS1kZW1vL2V4YW1wbGUteGRpdGEvMDItc2hvcnQtZmlsZS54bWwiLCJicmFuY2giOiJtYWluIiwicmVmZXJlciI6Imh0d3NyaHRzaHJ0cyJ9` }
    }).as('githubOAuth');

    // Intercept the token request
    const tokenRequest = /http:\/\/localhost:3000\/api\/github\/token\?.*/;
    cy.intercept('GET', tokenRequest, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        token: 'mock-token',
        installation: true
      }
    }).as('requestToken');

    cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referer=https://petal.evolvedbinary.com/');

    cy.get('body > div.toastify.on.toast.toast__panel.toast--welcome.toastify-right.toastify-top > section > button').click();
  })

  it('should open the PR dialog', () => {
    cy.get('#publishFile').click();
    cy.get('#prDialog').should('exist');
  });

  it('should close the PR dialog', () => {
    cy.get('#publishFile').click();
    cy.get('#closeButton').click();
    cy.get('#prDialog').should('not.exist');
  });

  // skip this test as the clicking outside the dialog is not working
  it.skip('should close the PR dialog when clicking outside the dialog', () => {
    cy.get('#publishFile').click();
    cy.get('#editor').click('topLeft', { force: true });
    cy.get('#prDialog').should('not.exist');
  });

  it('should point out the required filed', () => {
    cy.get('#publishFile').click();
    cy.get('#okButton').click();
    cy.focused().should('have.attr', 'id', 'titleInput');
  });

  it('should show the success message when the PR is created', () => {
    // mock the user data request
    const url = `http://localhost:3000/api/github/user`;
    cy.intercept('GET', url, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        login: 'mock-user'
      }
    }).as('getUserInfo');

    // Intercept the PR request
    const prRequest = `http://localhost:3000/api/github/integration`;
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

  it('should show the error message when the PR request fails', () => {
    // mock the user data request
    const url = `http://localhost:3000/api/github/user`;
    cy.intercept('GET', url, {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        login: 'mock-user'
      }
    }).as('getUserInfo');

    // Intercept the PR request
    const prRequest = `http://localhost:3000/api/github/integration`;
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
