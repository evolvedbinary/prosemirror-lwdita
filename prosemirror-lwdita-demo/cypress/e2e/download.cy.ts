describe('download a file', () => {

  it('downloads the file correctly', () => {
    cy.visit('http://localhost:1234/')
    .readFile('Test_File.json').
    should('not.exist')
    .get('#saveFile').click()
    .readFile('cypress/downloads/Test_File.json');
  })

  // TODO: For the time being we are testing a JDITA download.
  // Once the feature of downloading XDita is completed, change`mockJdita` test data to XDita.
  it('downloads the file correctly', () => {
    const mockJdita = `{"nodeName":"document","attributes":{},"children":[{"nodeName":"topic","attributes":{"parent":"doc","id":"program"},"children":[{"nodeName":"title","attributes":{"parent":"topic"},"children":[{"nodeName":"text","content":"Test File 2"}]},{"nodeName":"body","attributes":{"parent":"topic"},"children":[{"nodeName":"section","attributes":{"parent":"body"},"children":[{"nodeName":"p","attributes":{"parent":"section"},"children":[{"nodeName":"text","content":"A test paragraph."}]}]}]}]}]}`;
    cy.visit('http://localhost:1234/')
    .get('#saveFile')
    .click()
    .readFile('cypress/downloads/Test_File.json')
    .should('deep.equal', JSON.parse(mockJdita));
  })
})