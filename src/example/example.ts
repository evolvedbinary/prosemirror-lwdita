import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { schema } from "../schema";
import jsonDocLoader from "./doc";
import { keymap } from "prosemirror-keymap";
import { newLine } from "../commands";

const schemaObject = schema();

jsonDocLoader.then(jsonDoc => {
  const domEl = document.querySelector("#editor") as HTMLElement;
  domEl.innerHTML = '';
  if (domEl) {
    const doc = Node.fromJSON(schemaObject, jsonDoc);
    const state = EditorState.create({
      doc,
      plugins: [keymap({ Enter: newLine(schemaObject) })]
    })
    console.log(doc);
    console.log(state);
    new EditorView(domEl, {
      state,
    });
  }
});