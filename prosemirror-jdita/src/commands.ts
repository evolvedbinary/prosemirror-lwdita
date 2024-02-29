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
 * An image node is only retrieving the `href` attribute from the source, the according `alt` tag is not implemented yet.
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
 * `createNodesTree` will return the node object for a node tree that has been passed an an argument.
 *
 * @remarks
 * It is called by function `enterEOL`, which itself will be called on each `return key` event in the editor
 * when the cursor is placed at the end of a line. This creates a new node and needs this helper function to
 * update the transaction object and the view.
 *
 * @example excerpt of a `tree` array:
 * NodeType {name: 'p', schema: Schema, spec: {…}, groups: Array(5), attrs: {…}, …}
 * NodeType {name: 'section', schema: Schema, spec: {…}, groups: Array(0), attrs: {…}, …}
 *
 * @example of a returned node object:
 * Node {type: NodeType, attrs: {…}, content: Fragment, marks: Array(0)}
 *   attrs: {parent: '', props: '', dir: '', xml:lang: '', translate: '', …}
 *   content: Fragment {content: Array(0), size: 0}
 *   marks: []
 *   type : NodeType {name: 'p', schema: Schema, spec: {…}, groups: Array(5), attrs: {…}, …} ...
 *
 * @param tree - The node tree of type `NodeType` that has been passed
 * @returns The node object
 */
export function createNodesTree(tree: NodeType<Schema>[]): Node {
  let result: Node | undefined;
  // Go through the NodeType array ("tree")
  // and call `createAndFill()` on each item.
  tree.forEach(type => {
    // Create a node object.
    // If needed, create a new one to the start or
    // end of the given fragment to make it fit the node.
    // If no fitting wrapping can be found, return null.
    // Assign the result to variable "result".
    result = type.createAndFill({}, result) as Node;
  });
  // Return the node object
  return result as Node;
}

/**
 * `insertNode` creates a command to insert a new node at the current cursor position.
 *
 * @remarks
 * This function will be called by `insertItem()` which again will be called by `menu()`.
 * `insertNode` will help to create editor buttons in the editor menu bar,
 * currently these are the buttons for creating new ordered and unordered lists.
 * menu() -> insertItem() -> insertNode()
 *
 * @privateRemarks
 * TODO: Elaborate what happens in the
 * `!state.selection.empty` block and
 *
 * @param type - NodeType
 * @returns Command
 */
export function insertNode(type: NodeType<Schema>): Command {
  // type = the NodeTypes that have been initialized in the menu,
  // currently the types are `ol` and `ul` nodes (that can be inserted via the menu buttons)
  // state = the current EditorState
  // dispatch = without any interaction it will be undefined at runtime, but if triggered by clicking one of the
  // buttons with the according `type`, the Prosemirror `dispatch` function will be called:
  // this will dispatch a transaction
  return function (state, dispatch) {
    try {
      // TODO: Check the correct meaning of this condition
      // If the value for key "selection" in the EditorState object is not empty?
      // Cannot be confirmed by logging:
      // console.log('insertNode, state.selection=', state.selection);
      if (!state.selection.empty) {
        return false;
      }
      // "dispatch" becomes "true" when a button in the menu
      // has been clicked that matches the required NodeType, e.g. "ol" or "ul"
      if (dispatch) {
        // create a new node for the according type
        const node = createNode(type);
        // update the the transaction object and thus the EditorState
        const tr = state.tr.insert(state.selection.$to.end() + 1, node);
        // with the information about exact position and selection
        const pos = tr.selection.$to.doc.resolve(tr.selection.$to.pos + 2);
        // create a new text section at the given position info
        const newSelection = new TextSelection(pos, pos);
        // and update the transaction's current selection - it will determine the
        // selection that the editor gets when the transaction is applied.
        // Scroll to the updated node in the browser's editor window.
        dispatch(tr.setSelection(newSelection).scrollIntoView());
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Construct a type alias `InputContainerListener`
 *
 * TODO: Finish description, figure out syntax
 */
// Interface `HTMLInputElement` provides special properties and
// methods for manipulating the options, layout, and presentation of elements.
// Interface `Event` takes place in the DOM.
export type InputContainerListener = (this: HTMLInputElement, event: Event) => void;

/**
 * TODO: Documentation
 * currently used in `insertImageItem()` as a new instance
 */
export class InputContainer {
  // class fields:
  // optional, type HTMLInputElement
  _el?: HTMLInputElement;
  // Type parameters for Record are string and HTMLInputElement + Event,
  // both by default set to an empty object
  listeners: Record<string, InputContainerListener> = {};
  // bind object property "_el" to a function of type HTMLInputElement
  // or undefined that will be called when that property is looked up

  // class methods:
  get el(): HTMLInputElement | undefined {
    // will return the element of type HTMLInputElement
    return this._el;
  }

  // setter function with arguments of type HTMLInputElement or undefined
  set el(value: HTMLInputElement | undefined) {
    // will not do anything, if the the current HTML input element equals the to-be-set element
    if (this._el === value) {
      return;
    }
    this._el = value;
    // append an event listener for 'change' events on optional element "_el"
    // TODO: Figure out, what the listener exactly does (this.change.bind(this)?)
    this._el?.addEventListener('change', this.change.bind(this));
  }

  // TODO: Check if following description is correct
  change(event: Event) {
    // if field "_el" is available
    if (this._el) {
      const el = this._el;
      // method "keys" returns the names of the enumerable string properties and methods of object "this.listeners"
      Object.keys(this.listeners)
        // and returns the keys of the listeners array with value "function"
        .filter(key => typeof this.listeners[key] === 'function')
        // and binds those to the change event
        .forEach(key => this.listeners[key].bind(el)(event));
    }
  }
  // TODO: Describe method "on"
  on(key: string, listener: InputContainerListener) {
    this.off(key);
    this.listeners[key] = listener;
  }
  // TODO: Describe method "off"
  off(key: string) {
    if (this.listeners[key]) {
      delete (this.listeners[key]);
    }
  }
}

/**
 * Creates a command to insert a new Image node at the current cursor position.
 *
 * @remarks
 * Will be triggered onload via function menu() in example.ts
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
 * This function also ensures that the order of the nodes is correct.
 * Will be called on key event "enter pressed".
 *
 * @privateRemarks
 * TODO: This has the same comment as `canCreate` and is not precisely describing the function I think
 *
 * @param type - NodeType or nodeName
 * @returns node index from the list of nodes
 */
function canCreateIndex(type: NodeType) {
  //console.log('canCreateIndex, type=', type); // e.g. 4
  //console.log('canCreateIndex, type.name=', type.name); // e.g, "fn" ?
  //console.log("canCreateIndex, return value=", ['data', 'ul', 'li', 'p', 'section', 'stentry', 'strow', 'simpletable'].indexOf(type.name)); // e.g.NodeType {name: 'fn', schema: Schema, spec: {…}, groups: Array(2), attrs: {…}, …}
  return ['data', 'ul', 'li', 'p', 'section', 'stentry', 'strow', 'simpletable'].indexOf(type.name);
}

/**
 * Check if the node can be created or not.
 *
 * @remarks
 * Will be triggered on key "press enter" and evaluates
 *
 * @param type - NodeType object, contains the node name
 * @returns Boolean of whether the node can be created or not
 */
function canCreate(type: NodeType) {
  // TODO: Review, if following debug output makes sense in regard to
  // my conclusion, that the list of returned NodeTypes is a list of allowed nodes?
  // My suspicion is that this check must be related to the Node groups, because the groups seem
  // to share the group `all_blocks`. So a schema check might be implicitly done here.
  // But the list of nodes in canCreateIndex is not quite matching the below output...
  // I specifically wonder about the "fn" and "section" couple within a topic/body/section/p tag...

  //console.log('canCreate, NodeType=', type.name, ', index=', canCreateIndex(type), ', return', canCreateIndex(type) > -1);
  /**
   * Debug outputs when pressing "enter":
   * 1. Cursor at beginning of line in title node:
   *    NodeType topic       index -1 return false
   *
   * 2. Cursor at end of line in title node:
   *    NodeType body        index -1 return false
   *    NodeType prolog      index -1 return false
   *    NodeType shortdesc   index -1 return false
   *
   * 3. Cursor at beginning of line shortdesc:
   *    NodeType topic       index -1 return false
   *
   * 4. Cursor at end of line sortdesc:
   *    NodeType body        index -1 return false
   *    NodeType prolog      index -1 return false
   *
   * 5. Cursor anywhere in body/section/p, except for end of p:
   *    NodeType fn          index -1 return false
   *    NodeType section     index 4  return true
   *
   * 6. Cursor at end of topic/body/section/p:
   *    NodeType data        index 0  return true
   *    NodeType p           index 3  return true
   *    NodeType ol          index -1 return false
   *    NodeType pre         index -1 return false
   *    NodeType audio       index -1 return false
   *    NodeType video       index -1 return false
   *    NodeType fn          index -1 return false
   *    NodeType note        index -1 return false
   *    NodeType simpletable index 7  return true
   *    NodeType fig         index -1 return false
   *    NodeType dl          index -1 return false
   *    NodeType ul          index 1  return true
   *
   * 7. Cursor anywhere in topic/body/section/ol/li, except for end of li:
   *    NodeType li          index 2  return true
   *
   * 8. Cursor at end of topic/body/section/ol/li:
   *    NodeType data        index 0  return true
   *    NodeType p           index 3  return true
   *    NodeType ol          index -1 return false
   *    NodeType pre         index -1 return false
   *    NodeType audio       index -1 return false
   *    NodeType video       index -1 return false
   *    NodeType note        index -1 return false
   *    NodeType simpletable index 7  return true
   *    NodeType fig         index -1 return false
   *    NodeType dl          index -1 return false
   *    NodeType ul          index 1  return true
   */

  // check each node-"index" in list of allowed nodes and return evaluation of
  // "index" >= 0 (true | false)
  return canCreateIndex(type) > -1;
}

/**
 * Create an array of NodeTypes that are "allowed" nodes to be
 * added at the current curser position in the editor when pressing key "enter"
 *
 * @remarks
 * `defaultBlocks` will be triggered on key "press enter", function `enterEOL()`
 * which calls `defaultBlocksAt()`, in which `defaultBlocks()` is finally called.
 *
 *
 * @param pos - TODO
 * @param depth - The level of the newly created node within the document tree, type number
 * @returns TODO
 */
function defaultBlocks(pos: ResolvedPos, depth = 0) {
  const match = pos.node(-depth - 1).contentMatchAt(pos.indexAfter(-depth - 1));
  //console.log('defaultBlocks, match=', match,);
  let index = -1;
  // create an empty array of NodeTypes
  const result: NodeType[] = [];
  for (let i = 0; i < match.edgeCount; i++) {
    let edge = match.edge(i)
    //console.log('defaultBlocks, edge=', edge);
    // check, if a new node can be added after
    // hitting "enter" at the current cursor position
    if (canCreate(edge.type)) {
      console.log('defaultBlocks, added NodeType', edge.type.name);
      // if success, then add new NodeType object to the empty array of NodeTypes
      result.push(edge.type);
    }
  }
  //console.log('defaultBlocks, result=', result);
  return result;
}

/**
 * Get the default block Node at the current cursor position.
 *
 * @privateRemarks
 * TODO: We should elaborate on "preferred NodeType" and on "default blocks" (function above), it's just not clear what it means.
 *
 * @param pos - ResolvedPos current cursor position
 * @param depth - TODO
 * @param preferred - preferred NodeType
 * @returns NodeType
 */
function defaultBlockAt(pos: ResolvedPos, depth = 0, preferred?: NodeType) {
  let index = -1;
  let type: NodeType = null as any;
  // assign all allowed NodeType objects to variable `blocks`
  const blocks = defaultBlocks(pos, depth || undefined);

  // if the current node is contained in the default node blocks, then return the current node
  if (preferred && blocks.find(block => block.name === preferred.name)) {
    return preferred;
    console.log('defaultBlockAt, preferred=', preferred);
  }
  // loop through the default blocks and return the first block that can be created
  blocks.forEach(newType => {
    const newIndex = canCreateIndex(newType);
    console.log('defaultBlockAt, pos=', pos, ', depth=', depth, ', preferred=', preferred, ', newIndex=', newIndex, ', newType=', newType);
    if (newIndex > index) {
      index = newIndex;
      type = newType;
      console.log('defaultBlockAt, if newIndex', newIndex, '> than current index', index, ', return the type ', type);
    }
  });
  // return the newly created nodetype
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
 * This function is only triggered when the cursor is at the end of the line and the parent node is empty.
 * In this case, the function will delete the empty line and create a new line.
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
  // if the transaction is triggered from the last function call
  if (dispatch) {
    // check if the cursor is at the end of the line
    let atEnd = $to.parentOffset == $to.parent.content.size;
    // check if the previous node is empty
    const prevDepth = getPrevDepth(tr);
    if (prevDepth > 0) {
      debugger;
      // setting $from and $to is not necessary here, as they are already set above
      $from = tr.selection.$from;
      $to = tr.selection.$to;

      depth++;

      // TODO: Move following depth description to appropriate location
      // depth: number, it will show the level of the newly created element at the new cursor position
      // which is read from the ResolvedPos object
      // e.g. in this tree, beginning with root element doc [0] / topic [1] / body [2] / section [3] / p [4]
      // the p node has the depth/level "4"

      // split the parent node
      tr = tr.split(tr.mapping.map($from.pos), depth);
      console.log('enterSplit, depth=', depth);
      const pos = tr.selection.from;
      const selStart = pos - prevDepth * 2 - 2;
      const selEnd = selStart - prevDepth * 2 - 2;
      tr.setSelection(TextSelection.create(tr.doc, selStart, selEnd));
      // delete the empty node
      tr = tr.deleteSelection();
      tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(pos - depth * 2)));
      // complete the transaction
      return tr;
    }
    if (atEnd && depth > 1 && $from.depth - depth > 2) {
      const defaultType = $from.node(-depth + 1).type;
      return deleteEmptyLine(tr, depth - 1)
        .split(tr.mapping.map($from.pos), depth, [{ type: defaultType }] as any);
    }
    if (tr.selection instanceof TextSelection) tr.deleteSelection();
    // Object containing the information about parent (and name of grand-parent)
    // `parent` is returning the parent level (in this case `-depth` = -1)
    const parent = $to.node(-depth || undefined);
    // "$from": https://prosemirror.net/docs/ref/#state.Selection.$from
    // `parent.type`: It's giving us the current NodeType, where the cursor has been set to split the lines
    // @see {@link https://prosemirror.net/docs/ref/#model.NodeType}
    let defaultType = $from.depth == 0 ? null : defaultBlockAt($from, depth, parent.type);
    if (defaultType) {
      let types = atEnd ? [{ type: defaultType }] : null;
      // "can": Check whether splitting at the given position is allowed
      let can = canSplit(tr.doc, tr.mapping.map($from.pos), depth, types as any);
      // this 'if' statement is redundant, as we are already checking if we can split above with the same conditions.
      if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), depth, [{ type: defaultType }])) {
        types = [{ type: defaultType }];
        can = true;
      }
      // if we can split, then split the node
      if (can) {
        tr.split(tr.mapping.map($from.pos), depth, types as any);
        if (!atEnd && !$from.parentOffset && $from.parent.type != defaultType && $from.node(-depth).canReplace($from.index(-depth), $from.indexAfter(-depth), Fragment.from([(defaultType as NodeType).create(), $from.parent]))) {
          // update the previous node markups
          tr.setNodeMarkup(tr.mapping.map($from.before()), defaultType);
        }
      }
      // complete the transaction and scroll into view
      return tr.scrollIntoView();
    }
  }
  // return false if the transaction is not triggered.
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
 * `isEmpty` checks whether the cursor is at an empty line or not.
 *
 * @param tr - The Transaction object
 * @param depth - The default depth 0
 * @returns Boolean, e.g. true, if the the parent node has no content
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
 * `isPrevEmpty` - If the cursor is at the beginning of the line,
 * this function checks if the previous node is empty or not.
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
 * and checks the depth of the cursor position
 * by checking the Transaction object.
 *
 * @privateRemarks
 * TODO: Rename this function, as it doesn't reflect its purpose and is confusing.
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
 * `getPrevDepth` - TODO Documentation
 *
 * @remarks
 * Does not refer to the node depth nor the cursor depth nor the previous node depth.
 * It refers to the previous node if it's empty or not.
 *
 * @privateRemarks
 * TODO: This needs a sanity check
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
 * `getTree` - Get the tree of nodes starting from the current cursor position, and going up to ?? node.
 *
 * @privateRemarks Younes:
 * TODO: this function does not get the current tree but returns the new tree of elements that will be created.
 * TODO: needs further testing
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