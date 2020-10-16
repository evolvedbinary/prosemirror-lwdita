export { toggleMark } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';
import { chainCommands, Command } from 'prosemirror-commands';
import { ContentMatch, Fragment, MarkType, Node, NodeType, Schema } from 'prosemirror-model';
import { TextSelection, EditorState, Transaction, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export function createNode(type: NodeType<Schema>, args: Record<string, any> = {}): Node {
  switch (type.name) {
    case 'p': return type.createAndFill() as Node;
    case 'li': return type.createAndFill({}, createNode(type.schema.nodes['p'])) as Node;
    case 'stentry': return type.createAndFill({}, createNode(type.schema.nodes['p'])) as Node;
    case 'ul':
    case 'ol': return type.createAndFill({}, createNode(type.schema.nodes['li'])) as Node;
    case 'strow': return type.createAndFill({}, createNode(type.schema.nodes['stentry'])) as Node;
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

function canCreateIndex(type: NodeType) {
  return ['p'].indexOf(type.name);
}

function canCreate(type: NodeType) {
  return canCreateIndex(type) > -1;
}

function defaultBlockAt(match: ContentMatch) {
  let index = -1;
  let type: NodeType | null = null;
  for (let i = 0; i < match.edgeCount; i++) {

    let edge = match.edge(i)
    const newIndex = canCreateIndex(edge.type);
    if (newIndex > index) {
      index = newIndex;
      type = edge.type;
    }
  }
  console.log('type to create:', type?.name)
  return type;
}

export function enterEOL(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) {
  let {$from, $to, empty} = state.selection
  if (dispatch) {
    let tr = state.tr;
    const depth = 0;
    const parent = $to.node(depth || undefined);
    const grandParent = $to.node(-depth - 1);
    const type = defaultBlockAt(grandParent.contentMatchAt($to.indexAfter(-1)));
    if (type) {
      if (!empty) {
        tr = tr.deleteSelection();
        $from = tr.selection.$from;
        $to = tr.selection.$to;
      }
      let side = (!$from.parentOffset && $to.index() < parent.childCount ? $from : $to).pos
      tr = tr.insert(side, createNode(type))
      tr.setSelection(TextSelection.create(tr.doc, side + 2))
      dispatch(tr.scrollIntoView());
    }
  }
  return false;
}
export function enterEmpty(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) {
  let {$from, $to, empty} = state.selection;
  const depth = 0;
  const parent = $to.node(depth || undefined);
  const grandParent = $to.node(-depth - 1);
  let tr = state.tr;
  let side = (!$from.parentOffset && $to.index() < parent.childCount ? $from : $to).pos
  tr.setSelection(TextSelection.create(tr.doc, side, side + 2));
  return true;
}
export function enterSplit(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) {
  console.log('split');
  let {$from, $to} = state.selection;
  // TODO: node selection
  // if (state.selection instanceof NodeSelection) {
  //   if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false
  //   if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView())
  //   return true
  // }

  if (dispatch) {
    let atEnd = $to.parentOffset == $to.parent.content.size;
    let tr = state.tr;
    if (state.selection instanceof TextSelection) tr.deleteSelection();
    let defaultType = $from.depth == 0 ? null : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
    if (defaultType) {
      let types = atEnd ? [{ type: defaultType }] : null;
      let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types as any);
      if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, [{ type: defaultType }])) {
        types = [{ type: defaultType }];
        can = true;
      }
      if (can) {
        tr.split(tr.mapping.map($from.pos), 1, types as any);
        if (!atEnd && !$from.parentOffset && $from.parent.type != defaultType && $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from([ (defaultType as NodeType).create(), $from.parent ]))) {
          tr.setNodeMarkup(tr.mapping.map($from.before()), defaultType);
        }
      }
      dispatch(tr.scrollIntoView());
    }
  }
  return true
}

export function enterPressed(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) {
  let {$from, $to, empty} = state.selection;
  const depth = 0;
  const parent = $to.node(depth || undefined);
  const grandParent = $to.node(-depth - 1);
  const type = defaultBlockAt(grandParent.contentMatchAt($to.indexAfter(-1)))
  if ($to.parentOffset < parent.content.size) {
    return enterSplit(state, dispatch, view);
  }
  // end of line
  if ($from.parentOffset === 0) {
    return enterEmpty(state, dispatch, view);
    return false;
  }
  // not start of line
  // const type = state.schema.nodes.p;
  return enterEOL(state, dispatch, view);
}

export const newLine = chainCommands(enterPressed);
export function onewLine(schema: Schema): Command {
  const allowedNodes: Record<string, number> = {
    p: 1,
    li: 2,
    stentry: 2,
    strow: 2,
    // simpletable: 3,
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
      console.log('level:', i);
      console.log('  parent:', parent.type.name);
      if (allowedNodes[parent.type.name]) {
        grandParent = $from.node(i - 1);
        console.log('  grandParent:', grandParent.type.name);
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
          if (deleteParent) {
            // const table = $from.node(deletionDepth - 2);
            console.log('need to delete:', deleteParent, deletionDepth);
            tr = tr.delete($from.pos + deletionDepth, $from.pos);
            tr = tr.insert($from.pos, createNode(parent.type));
            dispatch(tr);
            // dispatch(tr.delete($from.pos - 1, $from.pos));
          } else {
            dispatch(tr.split($from.pos, depth).scrollIntoView());
          }
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