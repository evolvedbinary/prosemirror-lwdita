export { toggleMark } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';
import { Command } from 'prosemirror-commands';
import { Fragment, MarkType, Node, NodeType, Schema } from 'prosemirror-model';
import { TextSelection, EditorState } from 'prosemirror-state';
import { schema } from '../lib/example/schema';
import { document } from '../lib';

export function createNode(type: NodeType<Schema>, args: Record<string, any> = {}): Node {
  switch (type.name) {
    case 'p': return type.createAndFill() as Node;
    case 'li': return type.createAndFill({}, createNode(type.schema.nodes['p'])) as Node;
    case 'ul':
    case 'ol': return type.createAndFill({}, createNode(type.schema.nodes['li'])) as Node;
    case 'image': return type.createAndFill({ href: args.src }) as Node;
  }
  throw new Error('unkown node type: ' + type.name);
}

export function insertNode(type: NodeType<Schema>): Command {
  return function (state, dispatch) {
    try {
      if (!state.selection.empty) {
        return false;
      }
      if (dispatch) {
        const node = createNode(type);
        const tr = state.tr.insert(state.selection.$to.end() + 1, node);
        const pos = tr.selection.$to.doc.resolve(tr.selection.$to.pos + 2);
        const newSelection = new TextSelection(pos, pos);
        dispatch(tr.setSelection(newSelection).scrollIntoView());
      }
      return true;
    } catch(e) {
      console.info('Error inserting: ' + type.name);
      console.error(e);
      return false;
    }
  }
}

export type InputContainerListener = (this: HTMLInputElement, event: Event) => void;
export class InputContainer {
  _el?: HTMLInputElement;
  listeners: Record<string, InputContainerListener> = {};
  get el(): HTMLInputElement | undefined {
    return this._el;
  }
  set el(value: HTMLInputElement | undefined) {
    if (this._el === value) {
      return;
    }
    this._el = value;
    this._el?.addEventListener('change', this.change.bind(this));
  }
  change(event: Event) {
    if (this._el) {
      const el = this._el;
      Object.keys(this.listeners)
        .filter(key => typeof this.listeners[key] === 'function')
        .forEach(key => this.listeners[key].bind(el)(event));
    }
  }
  on(key: string, listener: InputContainerListener) {
    this.off(key);
    this.listeners[key] = listener;
  }
  off(key: string) {
    if (this.listeners[key]) {
      delete(this.listeners[key]);
    }
  }
}

export function insertImage(type: NodeType<Schema>, input: InputContainer): Command {
  return function (state, dispatch) {
    function fileSelected(this: HTMLInputElement, event: Event) {
      if (input.el?.files?.length === 1) {
        const file = input.el.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = () => {
          console.log('an error reading while reading the image');
        };
        reader.onload = () => {
          if (dispatch && typeof reader.result === 'string') {
            const node = createNode(type, { src: reader.result });
            const tr = state.tr.insert(state.selection.$to.pos, node);
            dispatch(tr.scrollIntoView());
          }
        };
      } else {
        console.log('can not add image:', input.el?.files?.length);
      }
    }
    try {
      if (!state.selection.empty) {
        return false;
      }
      if (dispatch) {
        if (!input.el) {
          console.log('no input found');
          return false;
        }
        input.el.value = '';
        input.on('command', fileSelected);
        return true;
      }
      return true;
    } catch(e) {
      console.info('Error inserting: ' + type.name);
      console.error(e);
      return false;
    }
  }
}

export function newLine(schema: Schema): Command {
  const allowedNodes: Record<string, number> = {
    p: 1,
    li: 2,
    dd: 2,
  };
  return function (state, dispatch) {
    let { $from, $to } = state.selection;
    let parent: Node | null = null;
    let grandParent: Node | null = null;
    let depth = 0;
    let deletionDepth = 0;
    let deleteParent = '';
    for (let i = $from.depth; i > 0; i--) {
      parent = $from.node(i);
      if (allowedNodes[parent.type.name]) {
        grandParent = $from.node(i - 1);
        depth = $from.depth - i + 1;
        if (parent.content.size + deletionDepth * 2 == 0 && grandParent.childCount == $from.indexAfter(deletionDepth - 1)) {
          deletionDepth--;
          deleteParent = parent.type.name;
          continue;
        }
        break;
      }
    }
    if (!parent || !grandParent) {
      return false;
    }
    if (allowedNodes[parent.type.name]) {
      let tr = state.tr.delete($from.pos, $to.pos);
      if (!canSplit(tr.doc, $from.pos - (deleteParent ? 1 : 0))) {
        return false;
      }
      if (deleteParent && depth === allowedNodes[deleteParent]) {
        return false;
      }
      if (dispatch) {
        const EOL = $to.end() === $to.pos;
        if (!deleteParent && EOL) {
          tr = tr.insert($to.pos + 1, createNode(parent.type));
          const pos = tr.selection.$to.doc.resolve(tr.selection.$to.pos + 2 * depth);
          const newSelection = new TextSelection(pos, pos);
          dispatch(tr.setSelection(newSelection).scrollIntoView());
        } else {
          dispatch(tr.split($from.pos - (deleteParent ? 1 : 0), depth - (deleteParent ? 1 : 0)).scrollIntoView());
        }
      }
      return true;
    } else {
      return false;
    }
  }
}

export function hasMark(state: EditorState, mark: MarkType): boolean {
  return state.selection.empty
    ? !!mark.isInSet(state.storedMarks || state.selection.$from.marks())
    : state.doc.rangeHasMark(state.selection.from, state.selection.to, mark);
}