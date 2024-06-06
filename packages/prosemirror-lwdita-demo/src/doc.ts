import { document } from "@evolvedbinary/prosemirror-lwdita";
import { xditaToJdita } from "@evolvedbinary/lwdita-xdita";


const storedFile = localStorage.getItem('file');
let xml: string;

// Read XML from the localStorage
// It should be stored there after uploading it via the editor UI,
// handled by demo-plugin.ts
if (storedFile) {
  xml = storedFile;
  //localStorage.removeItem('file');
}

// Otherwise take this XML example as a start for the demo editor
// It is the content of file petal-introduction.xml
if (!storedFile) {
  xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="petal">
    <title>What is Petal?</title>
    <body>
        <p dir="ltr">Sadly many projects lack proper documentation, but why is that?</p>
        <fig>
            <image href="https://static.evolvedbinary.com/petal/eb-rose-small.png"></image>
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
</topic>`;
}

// transform the xml to Jdita object
// then transform the Jdita object to Prosemirror schema
export default xditaToJdita(xml, true).then(json => document(json)) as Promise<Record<string, any>>;