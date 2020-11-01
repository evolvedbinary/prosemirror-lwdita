export { toggleMark } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';
import { chainCommands, Command } from 'prosemirror-commands';
import { ContentMatch, Fragment, MarkType, Node, NodeType, ResolvedPos, Schema } from 'prosemirror-model';
import { TextSelection, EditorState, Transaction, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export function createNode(type: NodeType<Schema>, args: Record<string, any> = {}): Node {
  switch (type.name) {
    case 'p': return type.createAndFill() as Node;
    case 'data': return type.createAndFill({}, type.schema.text('text')) as Node;
    case 'stentry': return type.createAndFill({}, createNode(type.schema.nodes['p'])) as Node;
    case 'strow': return type.createAndFill({}, createNode(type.schema.nodes['stentry'])) as Node;
    case 'simpletable': return type.createAndFill({}, createNode(type.schema.nodes['strow'])) as Node;
    case 'li': return type.createAndFill({}, createNode(type.schema.nodes['p'])) as Node;
    case 'stentry': return type.createAndFill({}, createNode(type.schema.nodes['p'])) as Node;
    case 'ul':
    case 'ol': return type.createAndFill({}, createNode(type.schema.nodes['li'])) as Node;
    case 'section': return type.createAndFill({}, createNode(type.schema.nodes['ul'])) as Node;
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
    } catch (e) {
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
      delete (this.listeners[key]);
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
        };
        reader.onload = () => {
          if (dispatch && typeof reader.result === 'string') {
            const node = createNode(type, { src: reader.result });
            const tr = state.tr.insert(state.selection.$to.pos, node);
            dispatch(tr.scrollIntoView());
          }
        };
      } else {
      }
    }
    try {
      if (!state.selection.empty) {
        return false;
      }
      if (dispatch) {
        if (!input.el) {
          return false;
        }
        input.el.value = '';
        input.on('command', fileSelected);
        return true;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

function canCreateIndex(type: NodeType) {
  return ['data', 'ul', 'li', 'p', 'section', 'stentry', 'strow', 'simpletable'].indexOf(type.name);
}

function canCreate(type: NodeType) {
  return canCreateIndex(type) > -1;
}

function defaultBlocks(pos: ResolvedPos, depth = 0) {
  const match = pos.node(-depth - 1).contentMatchAt(pos.indexAfter(-depth - 1));
  let index = -1;
  const result: NodeType[] = [];
  for (let i = 0; i < match.edgeCount; i++) {
    let edge = match.edge(i)
    if (canCreate(edge.type)) {
      result.push(edge.type);
    }
  }
  return result;
}

function defaultBlockAt(pos: ResolvedPos, depth = 0, prefered?: NodeType) {
  let index = -1;
  let type: NodeType = null as any;
  const blocks = defaultBlocks(pos, depth || undefined);
  if (prefered && blocks.find(block => block.name === prefered.name)) {
    return prefered;
  }
  blocks.forEach(newType => {
    const newIndex = canCreateIndex(newType);
    if (newIndex > index) {
      index = newIndex;
      type = newType;
    }
  });
  return type;
}

export function enterEOL(tr: Transaction, dispatch = false, depth = 0): Transaction | false {
  let { $from, $to, empty } = tr.selection
  const parent = $to.node(-depth || undefined);
  const grandParent = $to.node(-depth - 1);
  const type = defaultBlockAt($to, depth, parent.type);
  if (dispatch) {
    if (type) {
      let side = (!$from.parentOffset && $to.index() < parent.childCount ? $from : $to).pos + depth + 1;
      tr = tr.insert(side, createNode(type))
      tr = tr.setSelection(TextSelection.create(tr.doc, side + depth + 1));
      return tr.scrollIntoView();
    }
    return false;
  }
  return false;
}
export function enterEmpty(tr: Transaction, dispatch = false, depth = 0): Transaction | false {
  return enterEOL(tr, dispatch, depth);
}
export function enterSplit(tr: Transaction, dispatch = false, depth = 0): Transaction | false {
  depth++;
  let { $from, $to } = tr.selection;

  if (dispatch) {
    let atEnd = $to.parentOffset == $to.parent.content.size;
    if (tr.selection instanceof TextSelection) tr.deleteSelection();
    const parent = $to.node(-depth || undefined);
    let defaultType = $from.depth == 0 ? null : defaultBlockAt($from, depth, parent.type);
    if (defaultType) {
      let types = atEnd ? [{ type: defaultType }] : null;
      let can = canSplit(tr.doc, tr.mapping.map($from.pos), depth, types as any);
      if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), depth, [{ type: defaultType }])) {
        types = [{ type: defaultType }];
        can = true;
      }
      if (can) {
        tr.split(tr.mapping.map($from.pos), depth, types as any);
        if (!atEnd && !$from.parentOffset && $from.parent.type != defaultType && $from.node(-depth).canReplace($from.index(-depth), $from.indexAfter(-depth), Fragment.from([(defaultType as NodeType).create(), $from.parent]))) {
          tr.setNodeMarkup(tr.mapping.map($from.before()), defaultType);
        }
      }
      return tr.scrollIntoView();
    }
  }
  return false;
}

export function isEOL(state: EditorState, depth = 0) {
  const { $to } = state.selection;
  let parent = $to.parent;
  if ($to.parentOffset < parent.content.size) {
    return false;
  }
  for (let i = 1; i <= depth; i++) {
    const grandParent = $to.node(-i);
    if (grandParent.childCount !== 1 + $to.index(-i)) {
      return false;
    }
    parent = grandParent;
  }
  return true;
}
export function isEmpty(state: EditorState, depth = 0) {
  const { $to } = state.selection;
  let parent = $to.parent;
  if (parent.content.size) {
    return false;
  }
  for (let i = 1; i <= depth; i++) {
    const grandParent = $to.node(-i);
    if (parent.childCount > 1) {
      return false;
    }
    parent = grandParent;
  }
  return true;
}

export function getDepth(state: EditorState, empty = false) {
  let depth = 0;
  while((empty ? isEmpty : isEOL)(state, depth + 1)) {
    depth++;
  }
  return depth;
}

export function enterPressed(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) {
  let { $from, empty } = state.selection;
  const depth = getDepth(state, true);
  let resultTr: false | Transaction;
  let tr = state.tr;
  if (dispatch && !empty) {
    tr = tr.deleteSelection();
    $from = tr.selection.$from;
  }
  resultTr = isEOL(state, depth)
    ? $from.parentOffset === 0
      ? enterEmpty(tr, !!dispatch, depth)
      : enterEOL(tr, !!dispatch, depth)
    : enterSplit(tr, !!dispatch, depth);
  if (dispatch && resultTr !== false) {
    dispatch(resultTr);
    return true;
  }
  return false;
}

export const newLine = chainCommands(enterPressed);

export function hasMark(state: EditorState, mark: MarkType): boolean {
  return state.selection.empty
    ? !!mark.isInSet(state.storedMarks || state.selection.$from.marks())
    : state.doc.rangeHasMark(state.selection.from, state.selection.to, mark);
}