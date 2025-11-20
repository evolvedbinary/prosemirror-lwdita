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

import { mockXML } from "./download.cy";

describe("Open Xdita file", () => {
  it("should open the example xdita file", () => {
    // First, verify the fixture file exists
    cy.readFile('cypress/fixtures/sample.xml').should('exist')
    
    cy.visit('http://localhost:1234/')
    .get("#editor > div > div.ProseMirror-menubar > span:nth-child(1)")
    .click()
    .get('input[type="file"]')
    .selectFile('cypress/fixtures/sample.xml', { force: true })
    .get("#editor > div > div.ProseMirror > article > div > section > p")
    .should('contain.text', 'A test paragraph.')
  })
});

describe('Download Xdita file', () => {
  it('should download the current document as Xdita file', () => {
    // set up the entry xdita
    window.localStorage.setItem('file', mockXML);
    cy.visit('http://localhost:1234/')
      .get('#saveFile')
      .click()
      .readFile('cypress/downloads/Petal.xml')
      // compare the output to the input
      .should('equal', mockXML);
  });
});

// Undo/Redo tests
describe("Undo/Redo", () => {
  beforeEach(() => {
    window.localStorage.setItem('file', `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
  <topic id="program">
    <title>Test File 2</title>
    <body>
      <section>
        <p>A test paragraph.</p>
      </section>
    </body>
  </topic>`);
  });
  it("should be able to undo and redo changes", () => {
     cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > h1')
      .click()
    cy.focused()
      .type('YOLO')
      .get('#editor > div > div.ProseMirror > article > h1')
      .should('contain.text', 'Test File 2YOLO')
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(5) > div')
      .click()
      .get('#editor > div > div.ProseMirror > article > h1')
      .should('contain.text', 'Test File 2')
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(6) > div')
      .click()
      .get('#editor > div > div.ProseMirror > article > h1')
      .should('contain.text', 'Test File 2YOLO');
  });

  it("undo/redo should be disabled at the start and when not possible", () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(5) > div')
      .should('have.css', 'pointer-events', 'none')
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(6) > div')
      .should('have.css', 'pointer-events', 'none')
  });
});

// bold / underline / italic / subscript / superscript tests
describe("Text formatting", () => {
  beforeEach(() => {
    window.localStorage.setItem('file', `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
  <topic id="program">
    <title>Test File 2</title>
    <body>
      <section>
        <p>A test paragraph.</p>
      </section>
    </body>
  </topic>`);
  });

  it("should be able to apply bold formatting", () => {
    cy.visit('http://localhost:1234/')
      //#editor > div > div.ProseMirror > article > div > section > p
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{selectall}')
      // bold button #editor > div > div.ProseMirror-menubar > span:nth-child(8) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(8) > div')
      .click()
      // the bold button should now be active
      // #editor > div > div.ProseMirror-menubar > span:nth-child(8) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(8) > div')
      .should('have.class', 'ProseMirror-menu-active')
      .get('#editor > div > div.ProseMirror > article > div > section > p > strong')
      .should('exist');
  });

  it("should be able to apply underline formatting", () => {
    cy.visit('http://localhost:1234/')
      //#editor > div > div.ProseMirror > article > div > section > p
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{selectall}')
      // underline button #editor > div > div.ProseMirror-menubar > span:nth-child(9) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(9) > div')
      .click()
      // the underline button should now be active
      // #editor > div > div.ProseMirror-menubar > span:nth-child(9) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(9) > div')
      .should('have.class', 'ProseMirror-menu-active')
      .get('#editor > div > div.ProseMirror > article > div > section > p > u')
      .should('exist');
  });

  it("should be able to apply italic formatting", () => {
    cy.visit('http://localhost:1234/')
      //#editor > div > div.ProseMirror > article > div > section > p
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{selectall}')
      // italic button #editor > div > div.ProseMirror-menubar > span:nth-child(10) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(10) > div')
      .click()
      // the italic button should now be active
      // #editor > div > div.ProseMirror-menubar > span:nth-child(10) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(10) > div')
      .should('have.class', 'ProseMirror-menu-active')
      .get('#editor > div > div.ProseMirror > article > div > section > p > em')
      .should('exist');
  });

  it("should be able to apply subscript formatting", () => {
    cy.visit('http://localhost:1234/')
      //#editor > div > div.ProseMirror > article > div > section > p
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{selectall}')
      // subscript button #editor > div > div.ProseMirror-menubar > span:nth-child(11) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(11) > div')
      .click()
      // the subscript button should now be active
      // #editor > div > div.ProseMirror-menubar > span:nth-child(11) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(11) > div')
      .should('have.class', 'ProseMirror-menu-active')
      .get('#editor > div > div.ProseMirror > article > div > section > p > sub')
      .should('exist');
  });

  it("should be able to apply superscript formatting", () => {
    cy.visit('http://localhost:1234/')
      //#editor > div > div.ProseMirror > article > div > section > p
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{selectall}')
      // superscript button #editor > div > div.ProseMirror-menubar > span:nth-child(12) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(12) > div')
      .click()
      // the superscript button should now be active
      // #editor > div > div.ProseMirror-menubar > span:nth-child(12) > div
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(12) > div')
      .should('have.class', 'ProseMirror-menu-active')
      .get('#editor > div > div.ProseMirror > article > div > section > p > sup')
      .should('exist');
  });
});

// links to library and the prosemirror-lwdita repo
describe("Menu links", () => {
  it("should link to the ProseMirror library", () => {
    cy.visit('http://localhost:1234/')
      // #editor > div > div.ProseMirror-menubar > span:nth-child(20)
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(20)')
      .click()
      .url().should('include', 'https://github.com/evolvedbinary/lwdita')
  });

  it("should link to the prosemirror-lwdita repo", () => {
    cy.visit('http://localhost:1234/')
      // #editor > div > div.ProseMirror-menubar > span:nth-child(21)
      .get('#editor > div > div.ProseMirror-menubar > span:nth-child(21)')
      .click()
      .url().should('include', 'https://github.com/evolvedbinary/prosemirror-lwdita')
  });
});