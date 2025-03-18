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

import { Node, NodeSpec } from "prosemirror-model"

const localizationAttrs = {
  dir: {
    default: null
  },
  "xml:lang": {
    default: null
  },
  translate: {
    default: null
  },
}

export const IgnorenodeSpec: NodeSpec = {
  text: {
    group: 'inline',
    inline: true,
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    toDOM() { return ["br"] }
  },
  audio: {
    inline: false,

  },
  body: {
    inline: false,
    content: "(list_block)* section* div?",
    attrs: {
      ...localizationAttrs,
      outputclass: { default: null },
      class: { default: "- topic/body " },
      parent: { default: null },
    },
    toDOM(node: Node) {
      debugger
      const { dir ,outputclass, class: className } = node.attrs;
      return ["body", {
        dir,
        outputclass,
        class: className
      }, 0];
    }
  },
}