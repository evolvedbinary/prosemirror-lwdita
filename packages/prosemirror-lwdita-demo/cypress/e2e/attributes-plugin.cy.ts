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

describe('Attributes Plugin', () => {
  beforeEach(() => {
    
    window.localStorage.setItem('welcomeNoteConfirmed', 'true')
    window.localStorage.setItem('file', `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
  <topic id="program">
    <title>Test File 2</title>
    <body dir="ltr">
      <section id='section'>
        <p id="p1">A test paragraph.</p>
        <p>Second paragraph.</p>
        <p>Third paragraph.</p>
      </section>
    </body>
  </topic>`);
  })
  it('should open the attributes plugin', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
    cy.get('#attributes-editor-panel').should('be.visible')
  })
  it('Should show attributes of the first paragraph', () => {
    cy.visit('http://localhost:1234/')
      .get("#editor > div > div.ProseMirror > article > div > section > p:nth-child(1)")
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#attributes-editor-panel > h2').should('have.text', 'topic / body / section / p')
      .get('#id').should('have.value', 'p1')
  });

  it('Should add attributes', () => {
    cy.visit('http://localhost:1234/')
      .get("#editor > div > div.ProseMirror > article > div > section > p:nth-child(1)")
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id').type('test-id')
  });

  it('Should remove attributes from the document', () => {
    cy.visit('http://localhost:1234/')
      .get("#editor > div > div.ProseMirror > article > div > section > p:nth-child(1)")
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id').clear()
      .get('#save-attributes')
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id').should('have.value', '')
  });

  it('Should update attributes in the document', () => {
    cy.visit('http://localhost:1234/')
      .get("#editor > div > div.ProseMirror > article > div > section > p:nth-child(1)")
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id').clear()
      .type('updated-id')
      .get('#save-attributes')
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id').should('have.value', 'updated-id')
  });

  it('Should download document with attributes', () => {
    cy.visit('http://localhost:1234/')
      .get("#editor > div > div.ProseMirror > article > div > section > p:nth-child(2)")
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id')
      .type('new-id')
      .get('#save-attributes')
      .click()
    cy.get('#saveFile')
    .click()
    .readFile('cypress/downloads/Petal.xml')
    .should('contain', '<p id="new-id">Second paragraph.</p>');
    
  });

  it('Should travel up the tree', () => {
    cy.visit('http://localhost:1234/')
      .get("#editor > div > div.ProseMirror > article > div > section > p:nth-child(1)")
      .click()
    cy.get('#editor > div > div.ProseMirror-menubar  div.ic-tree')
      .click()
      .get('#id').should('have.value', 'p1')
      .get('#attributes-editor-panel > h2 > span:nth-child(3)')
      .click()
      .get('#id').should('have.value', 'section')
      .get('#attributes-editor-panel > h2 > span:nth-child(2)')
      .click()
      .get('#dir').should('have.value', 'ltr')
  })
});