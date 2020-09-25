import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import { toggleMark, newLine } from "./commands";

export function shortcuts(schema: Schema) {
  return keymap({
    Enter: newLine(schema),
    'Ctrl-b': toggleMark(schema.marks.b),
    'Ctrl-u': toggleMark(schema.marks.u),
    'Ctrl-i': toggleMark(schema.marks.i),
    'Ctrl-=': toggleMark(schema.marks.sub),
    'Ctrl-+': toggleMark(schema.marks.sup),
  });
}