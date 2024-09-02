import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { document as jditaToProsemirrorJson } from "@evolvedbinary/prosemirror-lwdita";
import { schema } from "@evolvedbinary/prosemirror-lwdita";
import { menu, shortcuts } from "@evolvedbinary/prosemirror-lwdita";
import { githubMenuItem, openFileMenuItem, saveFileMenuItem} from "./demo-plugin";
import { history } from "prosemirror-history";
import { doubleClickImagePlugin } from '@evolvedbinary/prosemirror-lwdita'
import { xditaToJdita } from "@evolvedbinary/lwdita-xdita";

const clientId = 'Iv23li0Pvl3E4crXIBQ0';

const schemaObject = schema();


const urlParams = new URLSearchParams(window.location.search);

const urlValue = `https://raw.githubusercontent.com/oasis-tcs/dita-lwdita/spec/org.oasis.xdita/samples/xdita/intro-product.dita`

export const githubAppCode = urlParams.get('code');

// the url should be 
//http://localhost:1234/?url=https://raw.githubusercontent.com/oasis-tcs/dita-lwdita/spec/org.oasis.xdita/samples/xdita/intro-product.dita

//https://github.com/apps/petal-demo/installations/select_target?state=localhost%3A1234
if(!githubAppCode) {
  window.open(`https://github.com/login/oauth/authorize?client_id=Iv23li0Pvl3E4crXIBQ0`, '_self');
}


if(urlValue) {
  console.log(urlValue); 
  // assert the url is a github url and a raw url

  // fetch the github document if possible
  fetch(urlValue)
  .then(response => response.text())
  .then(xml => xditaToJdita(xml, true))
  .then(json => jditaToProsemirrorJson(json) as Promise<Record<string, any>>) 
  .then(jsonDoc => {
    // get the editor element from the DOM
    const domEl = document.querySelector("#editor") as HTMLElement;
    // clear the element innerHTML
    domEl.innerHTML = '';
    // if the element exists, create a new EditorView
    if (domEl) {
      // take in the schema and the json document
      const doc = Node.fromJSON(schemaObject, jsonDoc);
      // create a new EditorState with the doc and the plugins
      const state = EditorState.create({
        doc,
        plugins: [
          // history plugin comes from prosemirror-history
          history(),
          // these were custom plugins check the prosemirror-lwdita/src/plugin.ts file
          shortcuts(schemaObject),
          menu(schemaObject, {
            end: [[
              githubMenuItem({ label: 'lwdita', url: 'https://github.com/evolvedbinary/lwdita' }),
              githubMenuItem({ label: 'prosemirror-lwdita', url: 'https://github.com/evolvedbinary/prosemirror-lwdita' }),
            ]],
            start: [[
              openFileMenuItem(),
              saveFileMenuItem()
            ]],
          }),
          doubleClickImagePlugin
        ]
      })
      // create a new EditorView with the dom element and the state
      new EditorView(domEl, {
        state,
      });
    }
  }).catch(e => {
    console.error(e);
  });

  // display the document in the editor
}