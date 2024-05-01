import { xditaToJson } from "jdita";
import { document } from "prosemirror-jdita";

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
if (!storedFile) {
  xml = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
  <topic id="program">
    <title>Test File 2</title>
    <body>
      <section>
        <p>A test paragraph.</p>
      </section>
    </body>
  </topic>`;
}

// transform the xml to Jdita object
// then transform the Jdita object to Prosemirror schema
export default xditaToJson(xml, true).then(json => document(json)) as Promise<Record<string, any>>;