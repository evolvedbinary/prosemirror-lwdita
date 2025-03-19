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

import { NodeType, ResolvedPos } from "prosemirror-model";
import { Plugin, TextSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view";
import { createNode, isEmpty, isEOL } from "./commands";
import { ChildType, getNodeClass, nodeGroups } from "@evolvedbinary/lwdita-ast";

type Suggestion = {
  type: NodeType,
  rank: number,
  label?: string,
  parent?: string
};

export const suggestionPlugin = new Plugin({
  props: {
    handleKeyDown(view, event) {
      if (event.key === 'Enter') {
        // make sure the cursor is at the end of a node or at an empty node
        if (isEOL(view.state.tr, 0) || isEmpty(view.state.tr, 0)) {
          const suggestions = getSuggestions(view);
          // Create a new suggestion popup
          const suggestionPopup = new SuggestionPopup(view, suggestions);
          view.dom.parentNode?.appendChild(suggestionPopup.dom);
          const firstListItem = suggestionPopup.dom.querySelector(".suggestionsList li") as HTMLLIElement;
          firstListItem?.focus();
          // Return true to indicate that the event was handled, no other handlers should be called.
          return true;
        }

      }
      return false;
    }
  }
})

class SuggestionPopup {
  dom: HTMLElement;
  editorView: EditorView;

  constructor(editorView: EditorView, suggestions: Suggestion[][]) {
    this.editorView = editorView;
    this.dom = document.createElement("div");
    this.dom.className = "suggestionsOverlay";

    this.addSuggestions(suggestions, editorView)
  }

  // generate the dom element for suggestions and adds the event handlers.
  addSuggestions(suggestions: Suggestion[][], editorView: EditorView) {
    // Create div, unordered list, with classes
    const popup = document.createElement('div');
    popup.className = 'suggestionsPopup';
    popup.style.position = "absolute";
    const pos = editorView.coordsAtPos(editorView.state.selection.$from.pos);
    popup.style.top = `${pos.top + window.scrollY}px`;
    popup.style.left = `${pos.left + window.scrollX}px`;
    this.dom.appendChild(popup);


    const ul_list = document.createElement("ul");
    ul_list.className = "suggestionsList";

    for(const subSuggestionsList of suggestions) {
      if(subSuggestionsList.length === 0) {
        continue;
      }
      const p = document.createElement('p');
      p.innerHTML = `Insert after <strong>${subSuggestionsList[0].parent}</strong>: `;
      ul_list.appendChild(p);

      for(const followingSibling of subSuggestionsList) {
        const li = document.createElement("li")
        li.className = "suggestion-item"
        li.textContent = followingSibling.label || "";
        li.tabIndex = 0
        ul_list.appendChild(li)
        li.addEventListener("click", (e) => {
          e.preventDefault();
          insertNode(editorView, followingSibling.type, followingSibling.parent);
          this.destroy();
        })
      }
    }

    popup.appendChild(ul_list) 

    popup.addEventListener("keydown", this.keyboardNavHandler.bind(this));

    // exit handler
    this.dom.addEventListener("click", e => {
      e.preventDefault()
      editorView.focus()
      this.destroy()
    });
  }

  keyboardNavHandler(e: KeyboardEvent) {
    e.preventDefault();
    const listItem = document.querySelectorAll(".suggestionsPopup li");
    const focusedElement = document.activeElement as HTMLLIElement;
    const focusedIndex = Array.from(listItem).indexOf(focusedElement) || 0;
    if (e.key === "Enter" || e.key === "i") {
      // Select the focused item
      focusedElement.click();
    } else if (e.key === "ArrowDown") {
      // Move focus to the next item
      const index = (focusedIndex + 1) % listItem.length;
      const nextElement = listItem[index] as HTMLLIElement;
      nextElement.focus();
    } else if (e.key === "ArrowUp") {
      // Move focus to the previous item
      const index = (focusedIndex - 1 + listItem.length) % listItem.length;
      const nextElement = listItem[index] as HTMLLIElement;
      nextElement.focus();
    } else if (e.key === "Escape") {
      this.destroy()
    }
  }
  destroy() {
    this.dom.remove();
    this.editorView.focus();
  }
}

/**
 * Inserts a new node at the current selection position
 *
 * @param view - The ProseMirror editor view instance.
 * @param nodeType - The type of the node to be inserted.
 */
function insertNode(view: EditorView, nodeType: NodeType, _parent?: string) {
  const { dispatch } = view;
  const { selection, tr, schema } = view.state;
  const { $from } = selection;

  const type = schema.nodes[nodeType.name];

  const node = createNode(type, { schema });
  if (!node) return;
  tr.insert($from.pos, node);

  const mapped = tr.mapping.map($from.pos);
  const resolvedPos = tr.doc.resolve(mapped + node.nodeSize);
  tr.setSelection(TextSelection.create(tr.doc, resolvedPos.pos));

  dispatch(tr.scrollIntoView())
}

/**
 * Retrieves a list of suggestions for the current selection in the editor view.
 *
 * @param view - The current editor view.
 * @returns A suggestion list for each node from the selection to the root.
 */
function getSuggestions(view: EditorView): Suggestion[][] {
  const { state } = view;
  const { $from } = state.selection;

  const path = pathToRoot($from).map((name) => name.replace("block_", ""));

  const suggestions = getFollowingSiblings(path, state.schema.nodes);

  // Inject the rank and label into the suggestions
  let nodeTypesWithRankAndLabel = suggestions.map((suggestionsSubList, index) => {
    const parentNodeInfo = getNodeLabelRank(path[index]);
    return suggestionsSubList.map((type) => {
      const { label, rank} = getNodeLabelRank(type.name.replace("block_", ""));
      return {
        type: type,
        label,
        rank,
        parent: parentNodeInfo.label
      }
    });
  });

  // sort the suggestions by rank
  nodeTypesWithRankAndLabel = nodeTypesWithRankAndLabel.map((subList) => {
    return subList.sort((a, b) => b.rank - a.rank);
  });

  return nodeTypesWithRankAndLabel;
}

/**
 * Generates a path from the current position to the root of the document.
 *
 * @param $from - The resolved position from which to start the path.
 * @returns An array of node type names representing the path to the root.
 */
function pathToRoot($from: ResolvedPos) {
  const path = [];
  let index = 0;
  while($from.node($from.depth - index).type.name !== 'doc') {
    path.push($from.node($from.depth - index).type.name);
    index++;
  }
  return path;
}

/**
 * Retrieves the following sibling nodes for each node in the given path to root.
 *
 * @param pathToRoot - path to the root of the node tree.
 * @param nodes - A record of node names to their corresponding NodeType objects.
 * @returns A 2D array of NodeType objects, the following siblings for each node in the node tree
 */
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
        for(let node of nodeGroups[(sibling as ChildType).name]) {
          if(!parentNode.allowsMixedContent()) {
            node = "block_" + node;
          }
          tempNodeTypes.push(nodes[node]);
        }
      } else {
        if(!parentNode.allowsMixedContent()) {
          tempNodeTypes.push(nodes["block_" +  (sibling as ChildType).name]);
        } else {
          tempNodeTypes.push(nodes[(sibling as ChildType).name]);
        }
        
      }
    }
    nodeTypes.push(tempNodeTypes);
  }
  
  return nodeTypes
}

/**
 * Retrieves the label and rank of a node based on its name.
 *
 * @param name - The name of the node.
 * @returns An object containing the label and rank of the node.
 */
function getNodeLabelRank(name: string) {
  const nodeClass = getNodeClass(name);
  const node = new nodeClass({});
  return {
    label: node.static.label,
    rank: node.static.rank
  }
}