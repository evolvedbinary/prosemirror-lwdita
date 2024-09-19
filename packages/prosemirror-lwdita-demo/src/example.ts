import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { schema } from "@evolvedbinary/prosemirror-lwdita";
import jsonDocLoader from "./doc";
import { menu, shortcuts } from "@evolvedbinary/prosemirror-lwdita";
import { githubMenuItem, openFileMenuItem, publishFileMenuItem, saveFileMenuItem} from "./demo-plugin";
import { history } from "prosemirror-history";
import { doubleClickImagePlugin, processRequest, fetchAndTransform } from '@evolvedbinary/prosemirror-lwdita'

const schemaObject = schema();

/**
 * Process the URL parameters and handle the notifications
 */
const urlParams = processRequest() as { key: string, value: string }[];

// if the user passes a file in the URL, load that file
// otherwise load the default file
let loadJsonDoc = jsonDocLoader;
if(urlParams) {
  const ghrepo = urlParams.find((param) => param.key === 'ghrepo');
  const source = urlParams.find((param) => param.key === 'source');

  // create a new promise to fetch the raw document from GitHub then transform it to ProseMirror JSON
  loadJsonDoc = fetchAndTransform(ghrepo?.value, source?.value);
}

/**
 * Load the json document and create a new EditorView.
 * The json document is transformed from JDITA to ProseMirror Schema
 */
loadJsonDoc.then(jsonDoc => {
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
            urlParams? publishFileMenuItem() : openFileMenuItem(),
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
  //TODO(YB): This should be the fall back page when we can't load the file
  console.error(e);
  const h2 = document.createElement('h2');
  h2.innerText = 'Failed to load the file';
  const p1 = document.createElement('p');
  p1.innerText = 'An error occured while loading your file.';
  // if (!e.length) {
  //   e = [e];
  // }
  // const ps: HTMLLIElement[] = e.map((error: any) => {
  //   console.log(error);
  //   const p = document.createElement('li');
  //   p.innerText = error;
  //   p.style.color = 'red';
  //   return p;
  // });
  const a = document.createElement('a');
  a.innerText = 'Click here to reload the sample document';
  a.href = '/';
  a.addEventListener('click', () => location.reload());
  const el: HTMLDivElement | null = document.querySelector("#editor");
  localStorage.clear();

  if (el) {
    el.innerHTML = '';
    el.style.flexDirection = 'column';
    el.style.padding = '0 3em';
    el.appendChild(h2);
    el.appendChild(p1);
    // const ul = document.createElement('ul');
    // ps.forEach(p => ul.appendChild(p));
    // el.appendChild(ul);
    el.appendChild(a);
  }
});