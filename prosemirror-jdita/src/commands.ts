export { toggleMark } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';
import { chainCommands, Command } from 'prosemirror-commands';
import { ContentMatch, Fragment, MarkType, Node, NodeType, ResolvedPos, Schema } from 'prosemirror-model';
import { TextSelection, EditorState, Transaction, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

/**
 * Create a new Node and fill it with the args as attributes.
 * Fill the node with the content if it's a block node.
 *
 * @privateRemarks
 * 1. An image node is only getting the `href` attribute, what about `alt`, is this not implemented yet?
 * 2. What about `case 'ul':` This is suddenly empty?
 *
 * @param type - NodeType
 * @param args - Node attributes
 * @returns a new Node
 */
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

/**
 * TODO: Documentation
 *
 * @param tree - TODO
 * @returns TODO
 */
export function createNodesTree(tree: NodeType<Schema>[]): Node {
  let result: Node | undefined;
  tree.forEach(type => {
    result = type.createAndFill({}, result) as Node;
  });
  return result as Node;
}

/**
 * Creates a command to insert a new node at the current cursor position.
 *
 * @privateRemarks
 * TODO: Elaborate what happens in the
 * 1. `!state.selection.empty` block and
 * 2. `in the dispatch block`
 *
 * @param type - NodeType
 * @returns Command
 */
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

/**
 * TODO: Documentation
 */
export type InputContainerListener = (this: HTMLInputElement, event: Event) => void;

/**
 * TODO: Documentation
 */
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

/**
 * Creates a command to insert a new Image node at the current cursor position.
 *
 * @privateRemarks
 * TODO: Error handling should be improved in `reader.onerror = () => {};`
 *
 * @param type - NodeType
 * @param input - InputContainer
 * @returns Command
 */
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

/**
 * Check if the node can be created or not.
 *
 * @privateRemarks
 * TODO: This has the same comment as `canCreate` and is not precisely describing the function I think
 *
 * @param type - NodeType or nodeName
 * @returns node index from the list of nodes
 */
function canCreateIndex(type: NodeType) {
  return ['data', 'ul', 'li', 'p', 'section', 'stentry', 'strow', 'simpletable'].indexOf(type.name);
}

/**
 * Check if the node can be created or not.
 *
 * @param type - NodeType or nodeName
 * @returns Boolean of whether the node can be created or not
 */
function canCreate(type: NodeType) {
  return canCreateIndex(type) > -1;
}

/**
 * TODO: Documentation
 *
 * @param pos - TODO
 * @param depth - TODO
 * @returns TODO
 */
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

/**
 * TODO: Documentation
 *
 * @param pos - TODO
 * @param depth - TODO
 * @param prefered - TODO
 * @returns TODO
 */
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

/**
 * TODO: Documentation
 *
 * @param tr - TODO
 * @param dispatch - TODO
 * @param depth - TODO
 * @returns TODO
 */
export function enterEOL(tr: Transaction, dispatch = false, depth = 0): Transaction | false {
  let { $from, $to, empty } = tr.selection
  const parent = $to.node(-depth || undefined);
  const grandParent = $to.node(-depth - 1);
  const type = defaultBlockAt($to, depth, parent.type);
  if (dispatch) {
    if (type) {
      let side = (!$from.parentOffset && $to.index() < parent.childCount ? $from : $to).pos + depth + 1;
      tr = tr.insert(side, createNodesTree(getTree($from, depth)));
      tr = tr.setSelection(TextSelection.create(tr.doc, side + depth + 1));
      return tr.scrollIntoView();
    }
    return false;
  }
  return false;
}

/**
 * Deletes the empty line in the current cursor position
 *
 * @param tr - The transaction object
 * @param depth - // TODO
 * @param shift - // TODO
 * @returns deleteSelection transaction object
 */
export function deleteEmptyLine(tr: Transaction, depth = 0, shift = 0): Transaction {
  // select the empty line and delete it
  return tr.setSelection(TextSelection.create(tr.doc, tr.selection.anchor - depth * 2 + shift, tr.selection.anchor + shift)).deleteSelection();
}

/**
 * Enter an empty enter press
 * this function only triggers when the cursor is at the end of the line and the parent node is empty
 * in this case, the function will delete the empty line and create a new line.
 *
 * @param tr - The Transaction object
 * @param dispatch - A boolean, set to `false`
 * @param depth - A number, set to `0`
 * @returns TODO
 */
export function enterEmpty(tr: Transaction, dispatch = false, depth = 0): Transaction | false {
  // if we are trying to go deeper in a empty node.
  if (depth > 0) {
    // delete the empty line
    deleteEmptyLine(tr, depth);
  }
  return enterEOL(tr, dispatch, depth);
}

/**
 * TODO: Documentation
 *
 * @param tr - TODO
 * @param dispatch - TODO
 * @param depth - TODO
 * @returns TODO
 */
export function enterSplit(tr: Transaction, dispatch = false, depth = 0): Transaction | false {
  depth++;
  let { $from, $to } = tr.selection;

  if (dispatch) {
    let atEnd = $to.parentOffset == $to.parent.content.size;
    const prevDepth = getPrevDepth(tr);
    if (prevDepth > 0) {
      $from = tr.selection.$from;
      $to = tr.selection.$to;
      depth++;
      tr = tr.split(tr.mapping.map($from.pos), depth);
      const pos = tr.selection.from;
      const selStart = pos - prevDepth * 2 - 2;
      const selEnd = selStart - prevDepth * 2 - 2;
      tr.setSelection(TextSelection.create(tr.doc, selStart, selEnd));
      tr = tr.deleteSelection();
      tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(pos - depth * 2)));
      return tr;
    }
    if (atEnd && depth > 1 && $from.depth - depth > 2) {
      const defaultType = $from.node(-depth + 1).type;
      return deleteEmptyLine(tr, depth - 1)
        .split(tr.mapping.map($from.pos), depth, [{ type: defaultType }] as any);
    }
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

/**
 * Check if the cursor is at the end of the line.
 *
 * @param tr - The Transaction object
 * @param depth - // TODO
 * @returns Boolean - true if the cursor is at the end of the line
 */
export function isEOL(tr: Transaction, depth = 0) {
  const { $to } = tr.selection;
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

/**
 * `isEmpty` Checks whether the cursor is at an empty line or not.
 *
 * @param tr - The Transaction object
 * @param depth - The default depth 0
 * @returns Boolean
 */
export function isEmpty(tr: Transaction, depth = 0) {
  const { $to } = tr.selection;
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

/**
 * `isPrevEmpty` If the cursor is at the beginning of the line, this function checks if the previous node is empty or not.
 *
 * @param tr - The Transaction object
 * @param depth - The default depth 0
 * @returns Boolean
 */
export function isPrevEmpty(tr: Transaction, depth = 0) {
  const pos = tr.doc.resolve(tr.selection.to - 2);
  let parent = pos.parent;
  if (parent.content.size) {
    return false;
  }
  for (let i = 1; i <= depth; i++) {
    const grandParent = pos.node(-i);
    if (parent.childCount > 1) {
      return false;
    }
    parent = grandParent;
  }
  return true;
}

/**
 * `getDepth` is triggered on each "press Enter" key event in the editor
 * and check the depth of the cursor position
 * by checking the Transaction object.
 *
 * @privateRemarks
 * TODO: Check if this value really returns the correct number!
 * 
 * @remarks Younes:
 * This does not mean cursor depth, it's always 0. it only returns 1 if the node is empty.
 * more like are you trying to go deeper in a empty node. this function will let you know.
 *
 * @param tr - The Transaction object
 * @param empty - A Boolean, set to `false`
 * @returns A number containing the depth of the tested
 */
export function getDepth(tr: Transaction, empty = false) {
  let depth = 0;
  while((empty ? isEmpty : isEOL)(tr, depth + 1)) {
    depth++;
  }
  return depth;
}

/**
 * `getPrevDepth` Does not refer to the node depth nor the cursor depth nor the previous node depth.
 * It refers to the previous node if it's empty or not.
 * //TODO this needs a sanity check
 *
 * @param tr - The Transaction object
 * @returns number - 1 or 0 if the previous node is empty or not
 */
export function getPrevDepth(tr: Transaction) {
  let depth = 0;
  while(isPrevEmpty(tr, depth + 1)) {
    depth++;

  }
  return depth;
}

/**
 * `getTree` Get the tree of nodes starting from the current cursor position, and going up to ?? node.
 * @remarks Younes: 
 * this function does not get the current tree but returns the new tree of elements that will be created.
 * //TODO needs further testing
 *
 * @param pos - The ResolvedPos object containing position, path, depth and parentOffset
 * @param depth - TODO
 * @returns TODO
 */
export function getTree(pos: ResolvedPos, depth = 0) {
  const result: NodeType<Schema>[] = [pos.parent.type];
  for (let i = 1; i <= depth; i++) {
    result.push(pos.node(-i).type);
  }
  return result;
}

/**
 * Handle pressing the `enter` key in the editor.
 * This contains an editor state, an optional `dispatch`
 * function that it can use to dispatch a transaction and
 * an `EditorView` instance. It returns a boolean that indicates
 * whether it could perform any action.
 * When no `dispatch` callback is
 * passed, the newLine command should do a 'dry run', determining whether it is
 * applicable, but not actually doing anything.
 *
 * @param state - The EditorState object
 * @param dispatch - A function to be used to dispatch a transaction
 * @param view - The EditorView object
 * @returns Boolean
 */
export function enterPressed(state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) {
  let { $from, empty } = state.selection;
  // check if the node is empty.
  // if the node is empty, then the depth is 1
  const depth = getDepth(state.tr, true);
  // prepare the transaction
  let resultTr: false | Transaction;
  // get the current transaction
  let tr = state.tr;
  // if the cursor selection is not empty, delete the selection
  if (dispatch && !empty) {
    tr = tr.deleteSelection();
    $from = tr.selection.$from;
  }

  resultTr = isEOL(state.tr, depth)       // when the cursor is at the end of the line
    ? $from.parentOffset === 0            // when the cursor is at the beginning of parent node
      ? enterEmpty(tr, !!dispatch, depth) // then enterEmpty is triggered
      : enterEOL(tr, !!dispatch, depth)   // when the cursor is not at the beginning of parent node, the cursor can be at the end text node, then enterEOL is triggered
    : enterSplit(tr, !!dispatch, depth);  // when the cursor is not at the end of the line, then enterSplit is triggered

  if (dispatch && resultTr !== false) {
    dispatch(resultTr);
    return true;
  }
  // return false if the transaction is not triggered
  return false;
}

/**
 * The `newLine` is a chain of commands that are triggered on each "press Enter" key event in the editor.
 * in this instance it's only representing the `enterPressed` command.
 */
export const newLine = chainCommands(enterPressed);

/**
 * `hasMark` checks the state of any mark against the
 * list of all marks in the editor menu
 * This function will be triggered on any key event in the editor to run the check.
 * Returns a boolean, if there is a mark of this type in the given set, or
 * if a given mark or mark type occurs in this document between the two given positions.
 *
 * @privateRemarks
 * TODO: Check plausability of returned booleans with logs below, they didn't seem to be reliable.
 *
 * @param state - The EditorState object
 * @param mark - The MarkType object
 * @returns Boolean
 */
export function hasMark(state: EditorState, mark: MarkType): boolean {
  return state.selection.empty
    ? !!mark.isInSet(state.storedMarks || state.selection.$from.marks())
    : state.doc.rangeHasMark(state.selection.from, state.selection.to, mark);
}