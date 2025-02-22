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
  let selectedIndex = 0;

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

  function renderPopup(view: EditorView, pos: any) {
    if (popupDom) {
      popupDom.remove();
      popupDom = null;
    }

    popupDom = document.createElement("div");
    popupDom.className = "popup-menu";
    popupDom.style.position = "absolute";
    popupDom.tabIndex = -1;

    const types = ["p", "section", "ul", "ol", "li", "table", "tr", "td"];
    types.forEach((type, index) => {
      const btn = document.createElement("button");
      btn.textContent = type;
      btn.tabIndex = 0;
      if (index === selectedIndex) {
        btn.classList.add("selected");
        btn.focus();
      }
      btn.onclick = () => {
        insertNode('p', schema, view);
        closePopup();
      };
      popupDom?.appendChild(btn);
    });

    popupDom.addEventListener("keydown", (e) => handleKeyDown(e, types, view));

    document.body.appendChild(popupDom);
    positionPopup(view, pos);
    popupDom.focus();
  }

  function handleKeyDown(event: KeyboardEvent, types: string[], view: any) {
    if (!popupDom) return;
    const buttons = popupDom.querySelectorAll("button");
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % buttons.length;
      buttons[selectedIndex].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;
      buttons[selectedIndex].focus();
    } else if (event.key === "i" || event.key === "I" || event.key === "Enter") {
      event.preventDefault();
      buttons[selectedIndex].click();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePopup();
    }
  }

  function positionPopup(view: { coordsAtPos: (arg0: any) => any; }, pos: any) {
    if (!popupDom) return;
    const coords = view.coordsAtPos(pos);
    popupDom.style.left = `${coords.left}px`;
    popupDom.style.top = `${coords.bottom + 5}px`;
  }

  function insertNode(type: string, schema: { nodes: { [x: string]: any; }; }, view: { state: any; dispatch: any; }) {
    const { state, dispatch } = view;
    const nodeType = schema.nodes[type];

    if (nodeType) {
      const node = nodeType.create();
      const { $from } = state.selection;
      const insertPos = $from.after(); // Insert after current block

      let tr = state.tr.insert(insertPos, node);

      // Place cursor inside the new node
      const resolvedPos = tr.doc.resolve(insertPos + 1);
      const selection = TextSelection.findFrom(resolvedPos, 1, true);
      tr = tr.setSelection(selection);
      tr = tr.scrollIntoView();
      dispatch(tr);
    }
  }

  function closePopup() {
    if (popupDom) {
      popupDom.remove();
      popupDom = null;
      selectedIndex = 0;
    }
  }
}

export function showPopupAt(view: EditorView, pos: number) {
  view.dispatch(
    view.state.tr.setMeta(popupPluginKey, { showPopup: true, popupPos: pos })
  );
}
