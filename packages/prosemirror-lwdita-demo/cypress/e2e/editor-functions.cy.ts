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

describe('Editor backspace function', () => {
  beforeEach(() => {
    window.localStorage.setItem('file', `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
    <topic id="program">
      <title>Test File 2</title>
      <body>
        <section>
          <p>A test paragraph.</p>
          <p>Another paragraph.</p>
          <p>Third paragraph.</p>
        </section>
      </body>
    </topic>`);
  });

  it('deletes text from the same paragraph', () => {
    const backspaceAmmount = "Another paragraph.".length;
    const backspaceCommand = `{Backspace}`.repeat(backspaceAmmount)
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > div > section > p:nth-child(2)') // select the paragraph in the middle
      .click()
    cy.focused()
      .type(backspaceCommand)
    cy.window().then( (win) => {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     expect((win as any).editorView.state.doc.toString()).to.eq('doc(block_topic(block_title("Test File 2"), block_body(block_section(block_p("A test paragraph."), block_p, block_p("Third paragraph.")))))')      
    })
  })

  it('deletes whole paragraph', () => {
    const backspaceAmmount = "Another paragraph.".length + 1;
    const backspaceCommand = `{Backspace}`.repeat(backspaceAmmount)
    cy.visit('http://localhost:1234/')
      .get('#editor > div > div.ProseMirror > article > div > section > p:nth-child(2)') // select the paragraph in the middle
      .click()
    cy.focused()
      .type(backspaceCommand)
    cy.window().then( win => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
     expect((win as any).editorView.state.doc.toString()).to.eq('doc(block_topic(block_title("Test File 2"), block_body(block_section(block_p("A test paragraph."), block_p("Third paragraph.")))))')      
    })
  })
}) 