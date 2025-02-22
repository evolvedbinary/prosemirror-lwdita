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

import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";
import { Schema, NodeType } from "prosemirror-model";

export const popupPluginKey = new PluginKey("popupPlugin");

export function popupPlugin(schema: Schema) {
  let popupDom: HTMLDivElement | null = null;

  return new Plugin({
    key: popupPluginKey,

    state: {
      init() {
        return { showPopup: false, popupPos: 0 };
      },
      apply(tr, value) {
        const meta = tr.getMeta(popupPluginKey);
        if (meta && typeof meta.showPopup !== "undefined") {
          return { ...value, showPopup: meta.showPopup, popupPos: meta.popupPos || value.popupPos };
        }
        return value;
      },
    },

    props: {
      decorations() {
        return DecorationSet.empty;
      },
      handleClick(view, pos, event) {
        const pluginState = popupPluginKey.getState(view.state);
        if (popupDom && popupDom.contains(event.target as Node)) {
          return false;
        }
        if (pluginState.showPopup) {
          view.dispatch(
            view.state.tr.setMeta(popupPluginKey, { showPopup: false })
          );
          closePopup();
          return true;
        }
        return false;
      },
    },

    view(view) {
      return {
        update(view) {
          const pluginState = popupPluginKey.getState(view.state);
          if (pluginState.showPopup) {
            renderPopup(view, pluginState.popupPos);
          } else {
            closePopup();
          }
        },
        destroy() {
          closePopup();
        },
      };
    },
  });

  function renderPopup(view: EditorView, pos: number) {
    if (popupDom) {
      popupDom.remove();
      popupDom = null;
    }

    popupDom = document.createElement("div");
    popupDom.className = "popup-menu";
    popupDom.style.position = "absolute";

    ["p", "section"].forEach((type) => {
      const btn = document.createElement("button");
      btn.textContent = type;
      btn.onclick = () => {
        insertNode(type, schema, view);
        closePopup();
      };
      popupDom!.appendChild(btn);
    });

    document.body.appendChild(popupDom);
    positionPopup(view, pos);
  }

  function positionPopup(view: EditorView, pos: number) {
    if (!popupDom) return;
    const coords = view.coordsAtPos(pos);
    popupDom.style.left = `${coords.left}px`;
    popupDom.style.top = `${coords.bottom + 5}px`;
  }

  function insertNode(type: string, schema: Schema, view: EditorView) {
    const { state, dispatch } = view;
    const nodeType: NodeType = schema.nodes[type];
    
    if (nodeType) {
      const node = nodeType.create();
      let tr = state.tr.insert(state.selection.$from.pos + 1, node);
      tr = tr.setSelection(TextSelection.create(tr.doc, state.selection.$from.pos + 2));
      dispatch(tr.scrollIntoView());
    }
  }

  function closePopup() {
    if (popupDom) {
      popupDom.remove();
      popupDom = null;
    }
  }
}

// Expose `showPopupAt`
export function showPopupAt(view: EditorView, pos: number) {
  view.dispatch(
    view.state.tr.setMeta(popupPluginKey, { showPopup: true, popupPos: pos })
  );
}
