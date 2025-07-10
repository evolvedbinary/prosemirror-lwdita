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

describe('inserts a Paragraph', () => {
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
  })

  it('Pop up shows up when hitting enter at the end of a line', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > h1')
      .click()
    cy.focused()
      .type('{enter}')
    cy.get('.suggestionsPopup').should('exist');
  })

  it.skip('Pop up will not shows up when hitting enter at the middle of the title', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > h1')
      .click()
    cy.focused()
      .type('{leftArrow}{enter}')
    cy.get('.suggestionsPopup').should('not.exist');
  })


  it('can insert a paragraph using the pop up', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{enter}{enter}')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .should('have.length', 2)
  })

  it('pop up shows in the begging of empty lines', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{enter}{enter}')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .last()
      .click()
    cy.focused()
      .type('{enter}')
    cy.get('.suggestionsPopup').should('exist');
  })

  it('can insert succession of paragraph using the pop up', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{enter}{enter}')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .last()
      .click()
    cy.focused()
      .type('{enter}{enter}')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .last()
      .click()
    cy.focused()
      .type('{enter}{enter}')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .last()
      .click()
    cy.focused()
      .type('{enter}{enter}')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .last()
      .click()
    cy.get('#editor > div > div.ProseMirror > article > div > section > p')
      .should('have.length', 5)
  })
});

describe('Splitting a paragraph', () => {
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
  })

  it('Can split a paragraph into two paragraphs', () => {
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .click()
    cy.focused()
      .type('{leftArrow}{leftArrow}{leftArrow}{leftArrow}{enter}') // hit left arrow 4 times to move the cursor to the middle of the paragraph, then hit enter
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .should('have.length', 2)
  });
});

describe('Inserting sections', () => {
  it('Can insert a new section at the end of another section', () => {

    window.localStorage.setItem('file', `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
    <topic id="program">
      <title>Test File 2</title>
      <body>
        <section>
          <p>A test paragraph.</p>
          <p>Second paragraph.</p>
          <p>Third paragraph.</p>
        </section>
      </body>
    </topic>`);

    cy.visit('http://localhost:1234/')
    // #editor > div > div.ProseMirror > article > div > section > p:nth-child(3)
      .get('#editor > div > div.ProseMirror > article > div > section > p:nth-child(3)')
      .click()
    cy.focused()
    // #editor > div > div.suggestionsOverlay > div > ul > li:nth-child(14)
      .type('{enter}')
    cy.get('#editor > div > div.suggestionsOverlay > div > ul > li:nth-child(14)')
      .click()
    // Make sure the new section is created and the cursor is in the expected place
    cy.focused()
      .type('new paragraph')
    cy.window().then( win => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((win as any).editorView.state.doc.toString())
        .to.eq('doc(block_topic(block_title("Test File 2"), block_body(block_section(block_p("A test paragraph."), block_p("Second paragraph."), block_p("Third paragraph.")), block_section(block_title("Section Title"), block_p("new paragraph")))))')      
    })
  });

  it('can create a new section in the middle of other sections', () => {

    window.localStorage.setItem('file', `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
      <topic id="program">
        <title>Test File 2</title>
        <body>
          <section>
            <p>A test paragraph.</p>
          </section>
          <section>
            <p>Another section paragraph.</p>
          </section>
        </body>
      </topic>`);
    
    cy.visit('http://localhost:1234/')
    // #editor > div > div.ProseMirror > article > div > section > p:nth-child(3)
      .get('#editor > div > div.ProseMirror > article > div > section > p')
      .first()
      .click()
    cy.focused()
    // #editor > div > div.suggestionsOverlay > div > ul > li:nth-child(14)
      .type('{enter}')
    cy.get('#editor > div > div.suggestionsOverlay > div > ul > li:nth-child(14)')
      .click()
    // Make sure the new section is created and the cursor is in the expected place
    cy.focused()
      .type('new paragraph')
    cy.window().then( win => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((win as any).editorView.state.doc.toString())
          .to.eq('doc(block_topic(block_title("Test File 2"), block_body(block_section(block_p("A test paragraph.")), block_section(block_title("Section Title"), block_p("new paragraph")), block_section(block_p("Another section paragraph.")))))')      
      })
    })
});