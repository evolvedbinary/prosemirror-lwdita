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
        renderAttributesEditor($from, view);

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

function renderAttributesEditor($from: ResolvedPos, view: EditorView): void {
  //if the panel is already open, remove it
  const existingPanel = document.getElementById('attributes-editor-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  const panel = document.createElement('div');
  panel.id = 'attributes-editor-panel';
  panel.className = 'debug-panel';

  document.body.appendChild(panel);

  const node = $from.node();

  if (node) { 
    // get attributes of the node from lwdita library
    const attrs = getNodeAttributes(node);
    panel.innerHTML = `<h1>\`${getNodeLabel(node)}\` attributes</h1>`;
    // for each attribute, create an input and label
    let path = pathToRoot($from).reverse().map((nodeName) => schemaNodeNameToLwditaNodeName(nodeName));
    path = path.map((name, idx) => {
      if (idx === path.length - 1) {
        return `<span class="breadcrumb" >${getNodePosRelativeToParent($from, name)}</span>`;
      }
      return `<span class="breadcrumb" >${name}</span>`;
    });

    panel.innerHTML += `<h1>Location:</h1>`;
    panel.innerHTML += `<h2>${path.join(' / ')}</h2>`;

    if (Object.keys(attrs).length > 0) {
      const ids = getNodesWithId(view); // Get all existing IDs in the document
      const attributesHtml = renderAttributes(attrs, ids);
      panel.innerHTML += `<div class="attributes">${attributesHtml}</div>`;

      panel.innerHTML += `<button id="save-attributes">Save Attributes</button>`;

      // Add event listener for the parent elements
      const parentElements = panel.querySelectorAll('h2 > span');
      parentElements.forEach((element, index) => {
        element.addEventListener('click', () => {
          const distanceFromNode = parentElements.length - index -2; 

          const ancestor = getAncestorAtDistance($from, distanceFromNode);
          
          if (ancestor) {
            const resolvedPos = view.state.doc.resolve(ancestor.pos);
            renderAttributesEditor(resolvedPos, view);
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

          panel.querySelectorAll('.attribute select').forEach((select) => {
            if (!select.id) return; // Skip if no id
            if(!(select as HTMLSelectElement).value) return; // Skip if no value
            updatedAttrs[select.id] = `#${(select as HTMLSelectElement).value}`;
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

/**
 * Render the attributes as HTML inputs
 * @param attrs - All attributes of the node
 * @param ids - All existing IDs in the document (used for conref dropdown)
 * @returns html string
 */
function renderAttributes(attrs: Record<string, string>, ids: string[]): string {
  let attributesHtml = ``;
  const sortedAttrs = Object.keys(attrs).sort((a, b) => getAttributeOptimalIndex(a) - getAttributeOptimalIndex(b));

  for (const attr of sortedAttrs) {
    switch (attr) {
      case 'class': // Skip the class attribute
      case 'parent': // Skip the parent attribute
        continue;
      case 'conref':
        attributesHtml += `<div class="attribute">
                  <label for="conref">conref:</label>
                    <select id="conref" name="conref">`
        attributesHtml += `<option value="" ${!attrs[attr] ? 'selected' : ''}>-- none --</option>`;
        attributesHtml += ids.map((id) => {
          return `<option value="${id}" ${attrs[attr] === `#${id}` ? 'selected' : ''}>${id}</option>`;
        }).join('\n');
        attributesHtml += `</select>
                </div>`;
        break;

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

function getAttributeOptimalIndex(attr: string): number {
  // Define the optimal order of attributes
  // This order is based on the common usage and importance of attributes in lwdita
  const attributeOptimalOrder = [
    `id`, `conref`, //%reuse;
    `keyref`, // keyref
    `href`, // href
    `type`, // note
    `colspan`, `rowspan`, `headers`, // table;
    `autoplay`, `controls`, `loop`, `muted`, `tabindex`, // media;
    `dir`, `xml:lang`, `translate`, //%localization;
    `format`, `scope`, //%reference-content;
    `props`, //%filters;
    `outputclass`
  ];
  return attributeOptimalOrder.indexOf(attr);
}

function getNodePosRelativeToParent($from: ResolvedPos, name: string): string {
  const index = $from.index(-1) + 1;

  if(index > 1) {
    return `${name}[${index}]`;
  }
  return `${name}`;
}


function getAncestorAtDistance($pos: ResolvedPos, distance: number) {
  const depth = $pos.depth - distance;
  if (depth < 0) return null;

  const node = $pos.node(depth);
  const pos = depth > 0 ? $pos.before(depth) : 0;
  return { node, pos, depth };
}


function getNodesWithId(view: EditorView): string[] {
  const ids: string[] = [];
  view.state.doc.descendants((node) => {
    if (node.attrs && node.attrs.id) {
      ids.push(node.attrs.id);
    }
  });
  return ids;
}