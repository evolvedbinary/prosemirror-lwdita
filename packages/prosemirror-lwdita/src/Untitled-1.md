# Check where the code is controlling the event for the enter key press
Commands.ts lines from 898 to 906
```
if (isEOL(state.tr, depth)) {
    // Enter pressed at the end of the line
    if ($from.parentOffset === 0) {
      // The line is empty
      resultTr = enterEmpty(tr, !!dispatch, depth)
    } else {
      //Entre pressed at the end of the line of a non-empty node
      resultTr = enterEOL(tr, !!dispatch, depth)
    }
  }
```
# Get the info from the enter press event and extract the node and parent node info
// the current node $from.nodeBefore;
// the parent node $from.parent
// The grand parent of the node $from.node(($from.depth - 1)) <= we will likely use this one
// we can get the allowed content from prosemirror node using NODE.type.spec.content
// eg inline*
// title? all_blocks*
// we have an issue of the groups not being marked by %


# Check If you can use the AST to get the possible following sibling of the current node
// NOW GETTING THE POSSIBLE NEXT SIBLING
1. using the info, parent name and grandparent allowed content 
2. We flatten that content using `stringToChildTypes` from the AST utils
  * we need to fix the groups as spec content does not mark the groups correctly
  * we flatten the groups eg inline => `text`, `b`, `em`, `i`, `ph`, `strong`, `sub`, `sup`, `tt`, `u`, `image`, `xref`
3. We need to check what can we add from that list, and we have few options for that
  * A custom function that matches `canAdd` ported to prosemirror
  * Using prosemirror `contentMatchAt` function 
  * or using the function from the schema `Node.type.validContent(Fragment.from(possible_child_type))`



# Consult with Adam at this stage
# Create a pop up with the possible following sibling of the current node