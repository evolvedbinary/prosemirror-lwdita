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

describe('Doctype and XML declaration', () => {
    it('should be able to round trip a document and keep the doctype', () => {
        // set up the entry xdita
        const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="petal">
    <title>What is Petal?</title>
</topic>
`;
        window.localStorage.setItem('file', mockXML);
        cy.visit('http://localhost:1234/')
            .get('#saveFile')
            .click()
            .readFile('cypress/downloads/Petal.xml')
            // compare the output to the input
            .should('equal', mockXML);
    });

    it('should add a default doctype to document without doctype header', () => {
        // set up the entry xdita
        const mockXML = `
<topic id="petal">
    <title>What is Petal?</title>
</topic>
`;
        // set up the default doctype header
        const doctype = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">`;
        window.localStorage.setItem('file', mockXML);
        cy.visit('http://localhost:1234/')
            .get('#saveFile')
            .click()
            .readFile('cypress/downloads/Petal.xml')
            // compare the output to the input
            .should('equal', doctype + mockXML);
    });

    it('should be able to round trip a document with a custom doctype header', () => {
        // set up the entry xdita
        const mockXML = `<?xml version="1.4" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD Custom DITA Topic//EN" "custom.dtd">
<topic id="petal">
    <title>What is Petal?</title>
</topic>
`;
        // set up the default doctype header
        window.localStorage.setItem('file', mockXML);
        cy.visit('http://localhost:1234/')
            .get('#saveFile')
            .click()
            .readFile('cypress/downloads/Petal.xml')
            // compare the output to the input
            .should('equal', mockXML);
    });
});