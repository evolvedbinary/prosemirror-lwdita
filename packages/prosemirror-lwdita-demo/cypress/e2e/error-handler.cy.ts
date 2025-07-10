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

// handle errors resulting from erronous URL parameters,
describe('handle errors resulting from erronous URL parameters', () => {
  it('Missing required URL parameters', () => {
    cy.visit('http://localhost:1234/?ghrepo=ghrepo&source=source&referrer=referrer');
    // should be redirected to the error page
    cy.url().should('include', '/error.html');
    cy.get('#errorHeadline').should('have.text', 'Invalid Request Parameters');
    cy.get('#errorBody').should('have.text', `It looks like the parameters in your request are invalid or incomplete. Please refer to the maintainer's documentation for correct usage or contact the developer for further assistance.`);
  });

  it('Missing referrer URL parameter', () => {
    cy.visit('http://localhost:1234/?ghrepo=ghrepo&source=source&branch=branch');
    // should be redirected to the error page
    cy.url().should('include', '/error.html');
    cy.get('#errorHeadline').should('have.text', 'Invalid Request Parameters');
    cy.get('#referrerLink').should('have.text', `Please contact the documentation team, and relay the above error message.`);
  });
});

describe('handle authentication errors', () => {
  it('User rejected GitHub OAuth', () => {
    it('should return a error when user does not authenticate', () => {
      // Intercept the GitHub OAuth URL
      const githubOAuthUrl = /https:\/\/github\.com\/login\/oauth\/authorize\?.*/;
  
      // Intercept the OAuth request and mock the authentication process
      cy.intercept('GET', githubOAuthUrl, {
        statusCode: 302,
        headers: { location: 'http://localhost:1234/?error=not-authenticated' }
      }).as('githubOAuth');
  
      // Visit the app page where the OAuth flow starts
      cy.visit('http://localhost:1234/?ghrepo=evolvedbinary/prosemirror-lwdita&source=packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml&branch=main&referrer=https://petal.evolvedbinary.com/');
  
      // Wait for the interception to occur
      cy.wait('@githubOAuth');
  
      // Verify that the error page is shown
      cy.url().should('match', /^http:\/\/localhost:1234\/error\.html\?/)
      cy.get('#errorHeadline').should('have.text', 'GitHub Integration Required');
    });
  });
});