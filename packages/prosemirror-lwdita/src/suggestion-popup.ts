/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { ChildType, getNodeClass, nodeGroups } from "@evolvedbinary/lwdita-ast";
import { NodeType, ResolvedPos } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { createNode } from "./commands";

type Suggestion = {
  type: NodeType,
  label?: string,
  rank: number
};


// Create and render suggestion popup
export function createAndRenderSuggestions(state: EditorState, view: EditorView) {
  // 1. get the current cursor position and node tree info
  // 2. get the suggestions
  // 3. render the suggestions
  // 4. add event listeners to the suggestions

  const { $from } = state.selection;

  // TODO this can be improved by only getting the path up to nodes that are at the end of their parent
  const pathToRoot = getNodePath($from);
  
  if($from.nodeAfter && $from.node().lastChild === $from.nodeAfter) {
    pathToRoot.unshift($from.nodeAfter.type.name);
  }
  
  // should we move this to another function with the injection of the rank and label? and sorting?
  const suggestions = getFollowingSiblings(pathToRoot, state.schema.nodes);

  // Inject the rank and label into the suggestions
  let nodeTypesWithRankAndLabel = suggestions.map((suggestionsSubList) => {
    return suggestionsSubList.map((type) => {
      const nodeClass = getNodeClass(type.name);
      const node = new nodeClass({});
      return {
        type: type,
        label: node.static.label,
        rank: node.static.rank
      }
    });
  });

  // sort the suggestions by rank
  nodeTypesWithRankAndLabel = nodeTypesWithRankAndLabel.map((subList) => {
    return subList.sort((a, b) => b.rank - a.rank);
  });

  const pathToRootLabels = pathToRoot.map((node) => {
    const nodeClass = getNodeClass(node);
    return new nodeClass({}).static.label || "";
  });
  
  // get the cursor position from prosemirror
  const pos = view?.coordsAtPos($from.pos);

  // create the suggestions popup
  const popup = createSuggestionsPopup(nodeTypesWithRankAndLabel, pathToRootLabels, view, {left: pos?.left || 0, top: pos?.top || 0 });

  // render the suggestions
  document.body.appendChild(popup);

  // take the focus away from the editor
  view.dom.blur();

  // focus on the first item in the list
  const firstListItem = document.querySelector("#suggestionsList li") as HTMLLIElement;
  firstListItem?.focus();
}

function getNodePath($from: ResolvedPos) {
  const path = [];
  let index = 0;
  while($from.node($from.depth - index).type.name !== 'doc') {
    path.push($from.node($from.depth - index).type.name);
    index++;
  }
  return path;
}

function getFollowingSiblings(pathToRoot: string[], nodes: Record<string, NodeType>) {
  const nodeTypes: NodeType[][] = [];
  for(let i = 1; i < pathToRoot.length; i++) {
    const tempNodeTypes: NodeType[] = [];
    const parentClass = getNodeClass(pathToRoot[i]);    
    const parentNode = new parentClass({});
    const siblings = parentNode.followingSiblings(pathToRoot[i - 1]);
    if(!siblings) continue; // if there are no siblings, return an empty array
    for(const sibling of siblings) {
      if((sibling as ChildType).isGroup) {
        for(const node of nodeGroups[(sibling as ChildType).name]) {
          tempNodeTypes.push(nodes[node]);
        }
      } else {
        tempNodeTypes.push(nodes[(sibling as ChildType).name]);
      }
    }
    nodeTypes.push(tempNodeTypes);
  }
  
  return nodeTypes;
}

function createSuggestionsPopup(nodeTypes: Suggestion[][], path: string[],view: EditorView, pos: {top: number, left: number}) {
  const overlay = document.createElement('div');
  overlay.id = 'suggestionsOverlay';

  const popup = document.createElement('div');
  popup.id = 'suggestionsPopup';
  popup.style.position = "absolute";
  popup.style.top = `${pos.top + window.scrollY}px`;
  popup.style.left = `${pos.left + window.scrollX}px`;
  overlay.appendChild(popup);

  // handle click outside the popup
  overlay.addEventListener("click", (_e) => {
    overlay.remove();
    // return focus to the editor
    view.focus();
  });

  // popup event listeners
  popup.addEventListener("keydown", (e) => {    
    const listItem = document.querySelectorAll("#suggestionsPopup li");
    const focusedElement = document.activeElement as HTMLLIElement;
    const focusedIndex = Array.from(listItem).indexOf(focusedElement) || 0;
    if (e.key === "Enter") {
      // Select the focused item
      focusedElement.click();
    } else if (e.key === "ArrowDown") {
    // Move focus to the next item
    const index = (focusedIndex + 1) % listItem.length;
    const nextElement = listItem[index] as HTMLLIElement;
    nextElement.focus();
    } else if (e.key === "ArrowUp") {
      console.log('pressed up ');
      // Move focus to the previous item
      const index = (focusedIndex - 1 + listItem.length) % listItem.length;
      const nextElement = listItem[index] as HTMLLIElement;
      nextElement.focus();
    } else if (e.key === "Escape") {
      // Remove the popup
      overlay.remove();
      // Return focus to the editor
      view.focus();
    }
  });

  const list = document.createElement('ul');
  list.id = 'suggestionsList';
  popup.appendChild(list);

  // keep track of depth
  let depth = 0;

  // create the list items for the suggestions
  for(const subList of nodeTypes) {
    if(subList.length === 0) {
      depth++;
      continue;
    }
    const p = document.createElement('p');
    p.innerHTML = `Insert after <strong>${path[depth]}</strong>: `;
    list.appendChild(p);
    for(const nodeType of subList) {
      const listItem = document.createElement('li');
      listItem.textContent = nodeType.label || "";
      listItem.tabIndex = 0;
      list.appendChild(listItem);
      listItem.addEventListener('click', () => {
        // insert the node
        insertNodeAfter(nodeType.type, depth, view);
        // remove the popup
        overlay.remove();
        // return focus to the editor
        view.focus();
      });
    }

    depth++;
  }

  return overlay;
}


function insertNodeAfter(newNodeType: NodeType, depth: number, view: EditorView) {
  const { state, dispatch } = view;
  const { selection } = state;
  const { $from, $to } = selection;
  const parent = $to.node($from.depth - depth);
  
  // get the new cursor position
  const side = (!$from.parentOffset && $to.index() < parent.childCount ? $from : $to).pos + 1;
  const transaction = state.tr.insert(side, createNode(newNodeType, {}));
  // select the new node
  transaction.setSelection(TextSelection.create(transaction.doc, side));
  // Apply the transaction
  return dispatch(transaction);
}
