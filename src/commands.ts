import { canSplit } from 'prosemirror-transform';
import { Command } from 'prosemirror-commands';
import { Fragment, Node, Schema, Slice } from 'prosemirror-model';
import { Selection, TextSelection } from 'prosemirror-state';

export function newLine(schema: Schema): Command {
  const splittable = [ schema.nodes.p ]
  return function (state, dispatch) {
    let { $from, $to } = state.selection;
    let parent: Node | null = null;
    let grandParent: Node | null = null;
    let depth = 0;
    for (let i = $from.depth; i > 0; i--) {
      parent = $from.node(i);
      if (splittable.indexOf(parent.type) > -1) {
        grandParent = $from.node(i - 1);
        depth = $from.depth - i + 1;
        console.log('depth', depth);
        break;
      }
    }
    if (!parent || !grandParent) {
      return false;
    }
    console.group('splitting:', parent.type.name);
    console.log('parent:', parent);
    console.log('$from:', $from);
    console.log('$to:', $to);
    if (parent.content.size == 0 && grandParent.childCount == $from.indexAfter(-1)) {
      console.log('this node is empty and last');
      console.groupEnd();
      return false;
    }
    switch (parent.type.name) {
      case 'p':
        let tr = state.tr.delete($from.pos, $to.pos);
        if (!canSplit(tr.doc, $from.pos)) {
          console.log('can\'t split');
          console.groupEnd();
          return false;
        }
        if (dispatch) {
          const EOL = $to.end() === $to.pos;
          if (EOL) {
            console.log('end of line');
            tr = tr.insert($to.pos + 1, Fragment.from(schema.nodes.p.createAndFill() as Node));
            const pos = tr.selection.$to.doc.resolve(tr.selection.$to.pos + 2);
            const newSelection = new TextSelection(pos, pos);
            dispatch(tr.setSelection(newSelection).scrollIntoView());
          } else {
            dispatch(tr.split($from.pos, depth).scrollIntoView());
          }
        }
        console.groupEnd();
        return true
      default:
        console.log('not implemented yet');
        console.groupEnd();
        return false;
    }
  }
}