import { canSplit } from 'prosemirror-transform';
import { Command } from 'prosemirror-commands';
import { Fragment, Node, Schema, Slice } from 'prosemirror-model';
import { Selection, TextSelection } from 'prosemirror-state';

export function newLine(schema: Schema): Command {
  return function (state, dispatch) {
    let { $from, $to } = state.selection;
    let parent = $from.parent;
    let grandParent = $from.node(-1);
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
            dispatch(tr.split($from.pos).scrollIntoView());
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