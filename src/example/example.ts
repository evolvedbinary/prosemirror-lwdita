import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { schema } from "../schema";
import jsonDocLoader from "./doc";

const s = schema();

jsonDocLoader.then(jsonDoc => {
  const domEl = document.querySelector("#editor") as HTMLElement;
  domEl.innerHTML = '';
  if (domEl) {
    const doc = Node.fromJSON(s, jsonDoc);
    const state = EditorState.create({
      doc,
      // plugins
    })
    console.log(doc);
    console.log(state);
    new EditorView(domEl, {
      state,
    });
  }
});