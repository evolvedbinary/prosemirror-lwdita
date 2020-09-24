export { toggleMark } from 'prosemirror-commands';
import { canSplit } from 'prosemirror-transform';
import { Command } from 'prosemirror-commands';
import { Fragment, Node, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

export function newLine(schema: Schema): Command {
  const splittable: Record<string, number> = {
    p: 1,
    li: 2,
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
      if (splittable[parent.type.name]) {
        grandParent = $from.node(i - 1);
        depth = $from.depth - i + 1;
        if (parent.content.size + deletionDepth * 2 == 0 && grandParent.childCount == $from.indexAfter(deletionDepth - 1)) {
          deletionDepth--;
          deleteParent = parent.type.name;
          continue;
        }
        console.log('depth', depth);
        break;
      }
    }
    if (!parent || !grandParent) {
      return false;
    }
    console.group('splitting:', parent.type.name);481
    console.log('parent:', parent);
    console.log('$from:', $from);
    console.log('$to:', $to);
    switch (parent.type.name) {
      case 'p':
      case 'li':
        let tr = state.tr.delete($from.pos, $to.pos);
        if (!canSplit(tr.doc, $from.pos - (deleteParent ? 1 : 0))) {
          console.log('can\'t split');
          console.groupEnd();
          return false;
        }
        if (deleteParent && depth === splittable[deleteParent]) {
          console.log('can\'t split further');
          console.groupEnd();
          return false;
        }
        if (dispatch) {
          const EOL = $to.end() === $to.pos;
          if (!deleteParent && EOL) {
            console.log('end of line');
            let content: Fragment | undefined;
            if (parent.type.name === 'li') {
              content = Fragment.from(schema.nodes.p.createAndFill() as Node);
            }
            tr = tr.insert($to.pos + 1, Fragment.from(parent.type.createAndFill({}, content) as Node));
            const pos = tr.selection.$to.doc.resolve(tr.selection.$to.pos + 2 * depth);
            const newSelection = new TextSelection(pos, pos);
            dispatch(tr.setSelection(newSelection).scrollIntoView());
          } else {
            dispatch(tr.split($from.pos - (deleteParent ? 1 : 0), depth - (deleteParent ? 1 : 0)).scrollIntoView());
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