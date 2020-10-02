import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { schema } from "../schema";
import jsonDocLoader from "./doc";
import { menu, shortcuts } from "../plugin";
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
        menu(schemaObject),
      ]
    })
    new EditorView(domEl, {
      state,
    });
  }
}).catch(e => console.error(e));