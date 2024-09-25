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

function clearLocalStorage() {
  window.localStorage.clear();
}

describe('The Welcome note:', () => {
  let loadPage: Cypress.Chainable<Cypress.AUTWindow>,
      note: { should: (arg0: string) => void; find: (arg0: any) => any; },
      noteSelector: string,
      dismissButton: { click: () => void; },
      dismissSelector: string,
      crossIconSelector: string;

  beforeEach(() => {
    loadPage = cy.visit('http://localhost:1234/');
    noteSelector = '.toast--welcome';
    dismissSelector = '.toast--dismiss';
    crossIconSelector = '.toast-close';
  })

  describe('When a user opens Petal for the first time', () => {
    beforeEach(() => {
      note = loadPage.get(noteSelector);
    })

    it('a "welcome" note will be displayed on page load', () => {
      note.should('be.visible');
    });
  });

  describe('When the user clicks on the dismiss button', () => {
    beforeEach(() => {
      note = loadPage.get(noteSelector);
      dismissButton = note.find(dismissSelector);
      dismissButton.click();
    })

    it('the note will be dismissed', () => {
      note.should('not.exist');
    });

    it('the note will be will not be shown on next visit', () => {
      note.should('not.exist');
    });
  });

  describe('When the user clicks on the cross icon button', () => {
    beforeEach(() => {
      clearLocalStorage();
      note = loadPage.get(noteSelector);
      dismissButton = note.find(crossIconSelector);
      dismissButton.click();
    })

    it('the note will be shown again on the next visit', () => {
      note.should('be.visible');
    });
  });
});



