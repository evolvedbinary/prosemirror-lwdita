describe('download a file', () => {

  it('downloads the file correctly', () => {
    cy.visit('http://localhost:9000/')
    .readFile('Test_File.json').
    should('not.exist')
    .get('#saveFile').click()
    .readFile('cypress/downloads/Test_File.json');
  })

  it('downloads the file correctly', () => {
    const mockJdita = `{"nodeName":"document","children":[{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","children":[{"nodeName":"text","content":"Test File 2"}]},{"nodeName":"body","children":[{"nodeName":"section","children":[{"nodeName":"p","children":[{"nodeName":"text","content":"A test paragraph."}]}]}]}]}]}`
    cy.visit('http://localhost:9000/')
    .get('#saveFile')
    .click()
    .readFile('cypress/downloads/Test_File.json')
    .should('deep.equal', JSON.parse(mockJdita));
  })
})