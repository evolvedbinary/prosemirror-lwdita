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

describe('Function renderPrDialog()', () => {
  let dialog;

  beforeEach(() => {
    dialog = cy.visit('http://localhost:1234/?ghrepo=ghrepo1&source=source1&referer=repo1');
  })

  it('opens a dialog with a form', () => {
    dialog
      .get('#editor #publishFile')
      .click()
      .get('#prOverlay')
      .find('form')
      .should('be.visible')
  });

  // TODO: This is just an interim solution as we only output the form data as console.log()
  it('lets users submit form data', () => {
    const expectedText = 'Title: My PR title';
    cy.spy(console, 'log').as('consoleLog');

    dialog
      .get('#editor #publishFile')
      .click()
      .get('#titleInput')
      .type(expectedText)
      .get('form')
      .submit()
      .get('@consoleLog').should('be.calledWith', expectedText);
  });
});

// TODO: Check if the form is submitted with correct API calls once the feature is ready
/*  it('lets users submit form data', () => {
    const expectedText = 'Title: My PR title';

    dialog
      .get('#editor #publishFile')
      .click()
      .get('#titleInput')
      .type(expectedText)
      .get('#okButton')
      .click()
      .should('')
  }); */

