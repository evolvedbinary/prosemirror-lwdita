import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { schema } from "../schema";
import jsonDocLoader from "./doc";
import { menu, shortcuts } from "../plugin";
import { githubMenuItem, openFileMenuItem } from "./demo-plugin";
import { history } from "prosemirror-history";

const schemaObject = schema();

jsonDocLoader.then(jsonDoc => {
  console.log(jsonDoc);
  const domEl = document.querySelector("#editor") as HTMLElement;
  domEl.innerHTML = '';
  if (domEl) {
    const doc = Node.fromJSON(schemaObject, jsonDoc);
    const state = EditorState.create({
      doc,
      plugins: [
        history(),
        shortcuts(schemaObject),
        menu(schemaObject, {
          end: [[
            githubMenuItem({ label: 'jdita', url: 'https://github.com/ccheraa/jdita' }),
            githubMenuItem({ label: 'prosemirror-jdita', url: 'https://github.com/ccheraa/prosemirror-jdita' }),
          ]],
          start: [[ openFileMenuItem() ]],
        }),
      ]
    })
    new EditorView(domEl, {
      state,
    });
  }
}).catch(e => {
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
  a.href = '#';
  a.addEventListener('click', () => location.reload());
  const el: HTMLDivElement | null = document.querySelector("#editor");
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