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

describe('inserts a line break', () => {
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
  
  it('can insert a line break in the title', () => {
    cy.visit('http://localhost:1234/')
    .get('#editor > div > div.ProseMirror > article > h1')
    .click()
    cy.focused()
    .type('{leftArrow}{enter}title')
    .should('contain.html', '<br>')
  })

  it('can insert a line break in the body', () => {
    cy.visit('http://localhost:1234/')
    .get('#editor > div > div.ProseMirror > article > div > section > p')
    .click()
    cy.focused()
    .type('{leftArrow}{enter}body')
    .should('contain.html', '<br>')
  })
})