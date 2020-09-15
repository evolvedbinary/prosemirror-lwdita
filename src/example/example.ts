import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { schema } from "../schema";
import jsonDocLoader from "./doc";

const s = schema();

jsonDocLoader.then(jsonDoc => {
  const domEl = document.querySelector("#editor");
  if (domEl) {
    const doc = Node.fromJSON(s, jsonDoc);
    const state = EditorState.create({
      doc,
      // plugins
    })
    new EditorView(domEl, {
      state,
    });
  }
});