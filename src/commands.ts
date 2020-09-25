export { toggleMark } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';
import { Command } from 'prosemirror-commands';
import { Fragment, MarkType, Node, Schema } from 'prosemirror-model';
import { TextSelection, EditorState } from 'prosemirror-state';

export function createNode(schema: Schema, type: string): Node {
  switch (type) {
    case 'p': return schema.nodes[type].createAndFill() as Node;
    case 'li': return schema.nodes[type].createAndFill({}, createNode(schema, 'p')) as Node;
  }
  throw new Error('unkown node type');
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
    console.group('splitting:', parent.type.name); 481
    if (allowedNodes[parent.type.name]) {
      let tr = state.tr.delete($from.pos, $to.pos);
      if (!canSplit(tr.doc, $from.pos - (deleteParent ? 1 : 0))) {
        console.groupEnd();
        return false;
      }
      if (deleteParent && depth === allowedNodes[deleteParent]) {
        console.groupEnd();
        return false;
      }
      if (dispatch) {
        const EOL = $to.end() === $to.pos;
        if (!deleteParent && EOL) {
          let content: Fragment | undefined;
          tr = tr.insert($to.pos + 1, createNode(schema, parent.type.name));
          const pos = tr.selection.$to.doc.resolve(tr.selection.$to.pos + 2 * depth);
          const newSelection = new TextSelection(pos, pos);
          dispatch(tr.setSelection(newSelection).scrollIntoView());
        } else {
          dispatch(tr.split($from.pos - (deleteParent ? 1 : 0), depth - (deleteParent ? 1 : 0)).scrollIntoView());
        }
      }
      console.groupEnd();
      return true;
    } else {
      console.groupEnd();
      return false;
    }
  }
}

export function hasMark(state: EditorState, mark: MarkType): boolean {
  return state.selection.empty
    ? !!mark.isInSet(state.storedMarks || state.selection.$from.marks())
    : state.doc.rangeHasMark(state.selection.from, state.selection.to, mark);
}