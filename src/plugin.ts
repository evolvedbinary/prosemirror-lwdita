import { keymap } from "prosemirror-keymap";
import { MarkType, NodeType, Schema } from "prosemirror-model";
import { menuBar, MenuElement, MenuItem, MenuItemSpec } from "prosemirror-menu";
import { toggleMark, newLine, hasMark, insertNode, insertImage, InputContainer } from "./commands";
import { Command } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";

const targetNode = document.getElementById('editor');
if (targetNode) {
  const config = { attributes: false, childList: true, subtree: true };
  const callback: MutationCallback = function(mutationsList) {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if((mutation.target as HTMLElement).classList.contains('ProseMirror-menubar')){
          let separators: HTMLElement[] = [];
          mutation.addedNodes.forEach(node => {
            if (node.childNodes[0] && (node.childNodes[0] as HTMLElement).classList.contains('separator')) {
              separators.push(node as HTMLElement);
            }
          });
          separators.forEach(separator => separator.style.flex = '1');
        }
      }
    }
  };
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

export function shortcuts(schema: Schema) {
  return keymap({
    Enter: newLine(schema),
    'Ctrl-b': toggleMark(schema.marks.b),
    'Ctrl-u': toggleMark(schema.marks.u),
    'Ctrl-i': toggleMark(schema.marks.i),
    'Ctrl-=': toggleMark(schema.marks.sub),
    'Ctrl-+': toggleMark(schema.marks.sup),
    'Ctrl-z': undo,
    'Ctrl-y': redo,
    'Ctrl-Shift-z': redo,
  });
}

function commandItem(command: Command, props: Partial<MenuItemSpec> = {}) {
  return new MenuItem({
    ...props,
    run: command,
    enable: command,
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

interface SimpleItemCallbacks {
  call: () => void;
  enable?: () => boolean;
  active?: () => boolean;
}

function simpleCommand(callbacks: SimpleItemCallbacks | (() => void), props: Partial<MenuItemSpec> = {}): MenuElement {
  if (typeof callbacks === 'function') {
    callbacks = { call: callbacks };
  }
  return new MenuItem({
    ...props,
    run: (state, dispatch) => {
      (callbacks as SimpleItemCallbacks).call();
      dispatch(state.tr);
    },
    enable: callbacks.enable,
    active: callbacks.active,
  });
}

function separator(): MenuElement {
  return new MenuItem({
    run: () => {},
    icon: {},
    enable: () => false,
    class: 'separator',
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
      el.classList.add('ProseMirror-menuitem-file');
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

interface Additions {
  start?: MenuElement[][];
  before?: MenuElement[][];
  after?: MenuElement[][];
  end?: MenuElement[][];
}

export function menu(schema: Schema, { start, before, after, end}: Additions = {}) {
  const debug = [
    separator(),
    simpleCommand({
      call: () => document.body.classList.toggle('debug'),
      active: () => document.body.classList.contains('debug'),
    }, { label: 'Show debug info', class: 'ic-bug', css: 'color: #c81200' }),
  ];
  const toolbar:MenuElement[][] = [[
    commandItem(undo, { icon: {}, title: 'Undo', class: 'ic-undo' }),
    commandItem(redo, { icon: {}, title: 'Redo', class: 'ic-redo' }),
  ], [
    markItem(schema.marks.b, { icon: {}, title: 'Bold', class: 'ic-bold' }),
    markItem(schema.marks.u, { icon: {}, title: 'Underlined', class: 'ic-underline' }),
    markItem(schema.marks.i, { icon: {}, title: 'Italic', class: 'ic-italic' }),
    markItem(schema.marks.sub, { icon: {}, title: 'Subscript', class: 'ic-subscript' }),
    markItem(schema.marks.sup, { icon: {}, title: 'Superscript', class: 'ic-superscript' }),
  ], [
    insertItem(schema.nodes.ol, { icon: {}, title: 'Ordered list', class: 'ic-olist' }),
    insertItem(schema.nodes.ul, { icon: {}, title: 'Unordered list', class: 'ic-ulist' }),
    insertImageItem(schema.nodes.image, { icon: {}, title: 'Insert image', class: 'ic-image' }),
  ]];
  if (!start) {
    start = [];
  }
  if (!before) {
    before = [];
  }
  if (!after) {
    after = [];
  }
  if (!end) {
    end = [];
  }
  if (after.length > 0) {
    after[after.length - 1] = [...after[after.length - 1], ...debug];
  } else {
    toolbar[toolbar.length - 1] = toolbar[toolbar.length - 1].concat(debug);
  }
  if (before.length > 0) {
    before[before.length - 1] = [separator(), ...before[before.length - 1]];
  } else {
    toolbar[0].unshift(separator());
  }
  return menuBar({ content: [
    ...start,
    ...before,
    ...toolbar,
    ...after,
    ...end,
  ] });
}
