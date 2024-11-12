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

const mockXML = `<?xml version="1.4" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//tes LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="petal">
    <title>What is Petal?</title>
    <body>
        <p dir="ltr">Sadly many projects lack proper documentation, but why is that?</p>
        <fig>
            <image href="https://static.evolvedbinary.com/petal/eb-rose-small.png">
                <alt></alt>
            </image>
        </fig>
        <p dir="ltr">The effort that goes into coding great software is paramount, but often
            pointless if others can't understand and use the software. Most developers have
            witnessed brilliant code with incomplete or entirely missing documentation. Petal lowers
            the barrier to delivering this critical part of any software product.</p>
        <p dir="ltr">Often it is difficult or time-consuming to add documentation to a project.
            Potentially great projects stay in obscurity because users and developers don't have the
            information they need to understand them and use them.</p>
        <p dir="ltr">Our dream is to make adding documentation to a project as easy as typing text
            into a web browser and hitting save. This approach would lead to more usable projects
            through robust and helpful documentation.</p>
        <p dir="ltr">Petal is a first of its kind technical documentation editor that realises this
            dream!</p>
        <p dir="ltr">Petal makes it simple to:</p>
        <ul>
            <li dir="ltr">
                <p dir="ltr">Create new pages of documentation</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Update existing pages of documentation</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Submit your work for review</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Accept documentation contributions from the community</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Integrate with version control repositories such as GitHub</p>
            </li>
        </ul>
        <p dir="ltr">Petal is:</p>
        <ul>
            <li dir="ltr">
                <p dir="ltr">A Visual Technical Documentation Editor</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Accessible through a Web Browser just like a Wiki</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Filling a gap in the market where other offerings are too complex</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Open Source</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Standards compliant</p>
            </li>
            <li dir="ltr">
                <p dir="ltr">Developed with the latest web technologies</p>
            </li>
        </ul>
        <p dir="ltr">Bad documentation keeps good projects from being GREAT.</p>
        <p dir="ltr">Petal helps anyone to contribute documentation to a project with ease. If you know how to type text on a computer, then you already know how to use Petal.</p>
    </body>
</topic>
`;

describe('download a file', () => {
  
  it('downloads the file correctly', () => {
    cy.visit('http://localhost:1234/')
    .readFile('Petal.xml').
    should('not.exist')
    .get('#saveFile').click()
    .readFile('cypress/downloads/Petal.xml');
  })


  it('downloads the file correctly', () => {
    cy.visit('http://localhost:1234/')
    .get('#saveFile')
    .click()
    .readFile('cypress/downloads/Petal.xml')
    .debug()
    .should('equal', mockXML);
  })
})