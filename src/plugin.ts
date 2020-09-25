import { keymap } from "prosemirror-keymap";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { menuBar, MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { toggleMark, newLine, hasMark, insertNode } from "./commands";
import { Command } from "prosemirror-commands";

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

function commandItem(command: Command, props: Partial<MenuItemSpec> = {}) {
  return new MenuItem({
    ...props,
    run: command
  });
}

function markItem(mark: MarkType, props: Partial<MenuItemSpec> = {}): MenuElement {
  return commandItem(toggleMark(mark), {
    ...props,
    active: state => hasMark(state, mark),
  });
}

function insertItem(type: NodeType, props: Partial<MenuItemSpec> = {}): MenuElement {
  return commandItem(insertNode(type), {
    ...props,
  });
}

export function menu(schema: Schema) {
  return menuBar({ content: [
    [
      markItem(schema.marks.b, { label: 'Bold' }),
      markItem(schema.marks.u, { label: 'Underlined' }),
      markItem(schema.marks.i, { label: 'Italic' }),
      markItem(schema.marks.sub, { label: 'Subscript' }),
      markItem(schema.marks.sup, { label: 'Superscript' }),
    ], [
      insertItem(schema.nodes.ol, { label: 'Ordered list' }),
      insertItem(schema.nodes.ul, { label: 'Unordered list' }),
    ]
  ] });
}