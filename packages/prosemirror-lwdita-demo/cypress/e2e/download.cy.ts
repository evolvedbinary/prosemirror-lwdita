describe('download a file', () => {

  it('downloads the file correctly', () => {
    cy.visit('http://localhost:1234/')
    .readFile('Petal.xml').
    should('not.exist')
    .get('#saveFile').click()
    .readFile('cypress/downloads/Petal.xml');
  })


  it('downloads the file correctly', () => {
    const mockXML = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd"><topic parent="doc" id="program">
    <title parent="topic">
        Test File 2
    </title>
    <body parent="topic">
        <section parent="body">
            <p parent="section">
                A test paragraph.
            </p>
        </section>
    </body>
</topic>
`;
    cy.visit('http://localhost:1234/')
    .get('#saveFile')
    .click()
    .readFile('cypress/downloads/Petal.xml')
    .debug()
    .should('equal', mockXML);
  })
})