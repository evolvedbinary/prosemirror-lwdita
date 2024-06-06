describe('download a file', () => {

  it('downloads the file correctly', () => {
    cy.visit('http://localhost:1234/')
    .readFile('Petal.xml').
    should('not.exist')
    .get('#saveFile').click()
    .readFile('cypress/downloads/Petal.xml');
  })


  it.skip('downloads the file correctly', () => {
    const mockXML = `<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
    <topic id="petal">
        <title>What is Petal?</title>`;

    cy.visit('http://localhost:1234/')
    .get('#saveFile')
    .click()
    .readFile('cypress/downloads/Petal.xml')
    .debug()
    .should('startWith', mockXML);
  })
})