import { keymap } from "prosemirror-keymap";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { menuBar, MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { toggleMark, newLine, hasMark, insertNode, insertImage, InputContainer } from "./commands";
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
  const command = toggleMark(mark);
  return commandItem(command, {
    ...props,
    active: state => hasMark(state, mark),
    enable: state => !state.selection.empty,
  });
}

function insertItem(type: NodeType, props: Partial<MenuItemSpec> = {}): MenuElement {
  return commandItem(insertNode(type), {
    ...props,
  });
}
function insertImageItem(type: NodeType, props: Partial<MenuItemSpec> = {}): MenuElement {
  const input = new InputContainer();
  const command = insertImage(type, input);
  return commandItem(command, {
    ...props,
    enable: command,
    render(editorView) {
      const el = document.createElement('div');
      el.classList.add('ProseMirror-menuitem-image');
      input.el = document.createElement('input');
      input.el.type = 'file';
      input.el.title = typeof props.title === 'function' ? props.title(editorView.state) : props.title || '';
      const label = document.createElement('span');
      label.innerHTML = props.label || '';
      el.appendChild(input.el);
      el.appendChild(label);
      if (command(editorView.state)) {
        el.classList.remove('ProseMirror-menu-disabled');
        input.el.disabled = false;
      } else {
        el.classList.add('ProseMirror-menu-disabled');
        input.el.disabled = true;
      }
      return el;
    },
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
      insertImageItem(schema.nodes.image, { label: 'Insert image', title: 'Insert images' }),
    ]
  ] });
}