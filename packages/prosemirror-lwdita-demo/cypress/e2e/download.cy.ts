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

export const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="fullTopic">
    <title>
        <b>bold</b>
        and <em>emphasized</em> and <i>italic</i> and <ph>Phrase content</ph> and
        <strong>strong</strong>
        and <sub>subscript</sub> and <sup>superscipt</sup> and <tt>tele type</tt> and
        <u>underline</u>
        <image href="https://static.evolvedbinary.com/petal/eb-rose-small.png">
            <alt>alt text</alt>
        </image>
    </title>
    <shortdesc>Short description of the full topic.</shortdesc>
    <prolog>
        <metadata>
            <othermeta name="test" content="test"/>
        </metadata>
    </prolog>
    <body dir="ltr">
        <p>Paragraph content</p>
        <p>
            <b>Bold</b>
            and <em>emphasized</em> and <i>italic</i> and <ph>Phrase content</ph> and
            <strong>strong</strong>
            and <sub>subscript</sub> and <sup>superscipt</sup> and <tt>tele type</tt> and
            <u>underline</u>.
        </p>
        <ul>
            <li>
                <p>Unordered list item</p>
            </li>
        </ul>
        <ol>
            <li>
                <p>Ordered list item</p>
            </li>
        </ol>
        <dl>
            <dlentry>
                <dt>Definition term</dt>
                <dd>
                    <p>Definition description</p>
                </dd>
            </dlentry>
        </dl>
        <pre>Preformatted content</pre>
        <audio autoplay="false" controls="true" loop="false" muted="true">
            <desc>Theme song for the LwDITA podcast</desc>
            <fallback>
                <p>The theme song is not available.</p>
            </fallback>
            <media-source href="https://static.evolvedbinary.com/petal/1943_Nov_14_NYPhil_Bernstein.ogg" format="application/ogg"/>
            <media-track srclang="en"/>
        </audio>
        <video outputclass="videoElement" width="320" height="240" controls="true">
            <desc>Kool-Aid Commercial, Debut of Pitcher Man</desc>
            <video-poster href="https://static.evolvedbinary.com/petal/1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm.jpg"/>
            <media-source href="https://static.evolvedbinary.com/petal/1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm"/>
        </video>
        <example>
            <title>title</title>
        </example>
        <simpletable>
            <title>Table title</title>
            <sthead>
                <stentry>
                    <p>Header 1</p>
                </stentry>
                <stentry>
                    <p>Header 2</p>
                </stentry>
            </sthead>
            <strow>
                <stentry>
                    <p>Row 1, Cell 1</p>
                </stentry>
                <stentry>
                    <p>Row 1, Cell 2</p>
                </stentry>
            </strow>
            <strow>
                <stentry>
                    <p>Row 2, Cell 1</p>
                </stentry>
                <stentry>
                    <p>Row 2, Cell 2</p>
                </stentry>
            </strow>
        </simpletable>
        <fig>
            <title>Figure title</title>
            <desc>Figure description</desc>
            <image href="https://static.evolvedbinary.com/petal/eb-rose-small.png">
                <alt>alt text</alt>
            </image>
        </fig>
        <note type="note">
            <p>Note content</p>
        </note>
        <section>
            <title>Section title</title>
            <p>Section content</p>
        </section>
        <div>
            <fn id="footnote">
                <p>A footnote</p>
            </fn>
        </div>
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