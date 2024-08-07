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

    cy.get('#editor > div > div.ProseMirror > article > div > section > p')
    .click()
    cy.focused()
    .type('body{enter}')
    .should('contain.html', '<br>')
  })
})