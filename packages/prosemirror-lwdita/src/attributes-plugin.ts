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

import { Node, ResolvedPos } from "prosemirror-model";
import { EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schemaNodeNameToLwditaNodeName } from "./utils";
import { pathToRoot } from "./suggestions-plugin";
import { getNodeClass } from "@evolvedbinary/lwdita-ast";

export const debugPluginKey = new PluginKey('debugView');

export const debugPlugin = new Plugin({
  key: debugPluginKey,
  state: {
    init: () => ({ active: false }),
    apply(tr, value) {
      const meta = tr.getMeta(debugPluginKey);
      if (meta?.toggle) {
        return { ...value, active: !value.active };
      }
      return value;
    },
  },
  view(_view: EditorView) {

    return {
      update(view) {
        // Update the panel visibility based on the plugin state
        const { active } = debugPluginKey.getState(view.state);
        document.body.classList.toggle('debug', active);
        if (!active) {
          destroy();
          return;
        }

        const $from = view.state.selection.$from;
        const node = $from.node();
        renderAttributesEditor(node, $from, view);

      }
    };
  },
});

export function toggleDebugCommand() {
  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    if (dispatch) {
      const tr = state.tr.setMeta(debugPluginKey, { toggle: true });
      dispatch(tr);
    }
    return true;
  };
}

function getNodeAttributes(node: Node): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node.attrs || {})) {
    attributes[key] = value.toString();
  }
  return attributes;
}

function renderAttributesEditor(node: Node, $from: ResolvedPos, view: EditorView): void {
  //if the panel is already open, remove it
  const existingPanel = document.getElementById('attributes-editor-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  const panel = document.createElement('div');
  panel.id = 'attributes-editor-panel';
  panel.className = 'debug-panel';
  panel.innerHTML = '<h1>Edit attributes</h1>';

  document.body.appendChild(panel);


  if (node) {
    // get attributes of the node from lwdita library
    const attrs = getNodeAttributes(node);
    // for each attribute, create an input and label
    const path = pathToRoot($from).reverse().map((nodeName) => schemaNodeNameToLwditaNodeName(nodeName)).map(e => `<span>${e}</span>`).join(' > ');
    panel.innerHTML += `<h1>${getNodeLabel(node)} element</h1>`;
    panel.innerHTML += `<h2>${path}</h2>`;
    if (Object.keys(attrs).length > 0) {
      const attributesHtml = renderAttributes(attrs);
      panel.innerHTML += `<div class="attributes">${attributesHtml}</div>`;

      panel.innerHTML += `<button id="save-attributes">Save Attributes</button>`;

      // Add event listener for the parent elements
      const parentElements = panel.querySelectorAll('h2 > span');
      parentElements.forEach((element, index) => {
        element.addEventListener('click', () => {
          const distanceFromNode = parentElements.length - index - 1
          if (distanceFromNode < 1) {
            console.warn('Distance from node is less than 1, cannot resolve parent node.');
            return;
          }
          const parentNode = $from.node(-distanceFromNode);
          const pos = $from.before() - distanceFromNode + 1; // Adjust position to the start of the parent node
          const resolvedPos = view.state.doc.resolve(pos);

          if (parentNode) {
            renderAttributesEditor(parentNode, resolvedPos, view);
          }
        });
      });

      // Add event listener for the save button
      const saveButton = panel.querySelector('#save-attributes');
      if (saveButton) {
        saveButton.addEventListener('click', () => {
          const updatedAttrs: Record<string, string> = {};
          panel.querySelectorAll('.attribute input').forEach((input) => {
            if (!input.id) return; // Skip if no id

            if ((input as HTMLInputElement).name === 'translate' && (input as HTMLInputElement).checked) {
              updatedAttrs['translate'] = (input as HTMLInputElement).value;
            } else {
              updatedAttrs[input.id] = (input as HTMLInputElement).value;
            }

          });
          const tr = view.state.tr.setNodeMarkup($from.before(), undefined, updatedAttrs);
          view.dispatch(tr);
        });
      }

    } else {
      panel.innerHTML += `<p>No attributes found for this node.</p>`;
    }

  } else {
    panel.innerHTML = `<h1>No node at position ${$from.pos} </h1>`;
  }
}

function getNodeLabel(node: Node): string {
  const nodeName = schemaNodeNameToLwditaNodeName(node.type.name);
  const NodeClass = getNodeClass(nodeName);
  const nodeInstance = new NodeClass(node.attrs);
  return nodeInstance.static.label || nodeName;
}

function destroy() {
  
  document.body.classList.remove('debug');
  const panel = document.getElementById('attributes-editor-panel');
  if (panel) {
    panel.remove();
  }
}

function renderAttributes(attrs: Record<string, string>): string {
  let attributesHtml = ``;

  for (const attr of Object.keys(attrs)) {
    switch (attr) {
      case 'class': // Skip the class attribute
      case 'parent': // Skip the parent attribute
        continue;

      case 'translate':
        attributesHtml += `<div class="attribute">
  <label>translate:</label>
  <div class="radio-group">
    <input type="radio" name="translate" value="yes" id="translate-yes" ${attrs[attr] === 'yes' ? 'checked' : ''}>
    <label for="translate-yes">Yes</label>

    <input type="radio" name="translate" value="no" id="translate-no" ${attrs[attr] === 'no' ? 'checked' : ''}>
    <label for="translate-no">No</label>
  </div>
</div>`;
        break;

      default:
        attributesHtml += `<div class="attribute">
                  <label for="${attr}">${attr}:</label>
                  <input type="text" id="${attr}" value="${attrs[attr]}" />
                </div>`;
        break;
    }
  }

  return attributesHtml;
}