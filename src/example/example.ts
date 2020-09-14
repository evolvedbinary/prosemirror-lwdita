import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, Node } from "prosemirror-model"
import { schema } from "./schema"
import jsonDoc from "./doc"

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: schema.spec.nodes,
  marks: schema.spec.marks
});

const domEl = document.querySelector("#editor");
if (domEl) {
  const doc = Node.fromJSON(schema, jsonDoc);
  const state = EditorState.create({
    doc,
    // plugins: exampleSetup({schema: mySchema})
  })
  console.log(doc);
  console.log(state);
  new EditorView(domEl, {
    state,
  });
}