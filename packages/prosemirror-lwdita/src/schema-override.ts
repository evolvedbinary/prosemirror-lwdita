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

export const nodeSpec: NodeSpec = {
  text: {
    group: 'inline',
    inline: true,
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() { return ["br"] }
  } as NodeSpec,
  p: {
    inline: false,
    group: "all_blocks",
    parseDOM: [
      {
        tag: "[data-j-type=p]"
      }
    ],
    content: "inline*",
    toDOM() {
      return ['p', {}, 0]
    }
  },
  p_block:{
    
  },
  body: {
    content: "section*",
    attrs: {
      ...localizationAttrs,
      outputclass: { default: null },
      class: { default: "- topic/body " },
      parent: { default: null },
    },
    toDOM(node: Node) {
      const { class: className, parent: parentName , ...attrs } = node.attrs;
      return ["div", {
        "data-j-class": className,
        "data-j-parent": parentName,
        ...attrs
      }, 0];
    }
  },
  section: {
    inline: false,
    content: "title? all_blocks*",
    toDOM() {
      return ['section', {}, 0]
    }
  },
  title: {
    "inline": false,
    parseDOM: [
      {
        tag: "[data-j-type=title]"
      }
    ],
    content: "inline*",
    toDOM() {
      return ['h1', {}, 0]
    }
  },
  topic: {
    inline: false,
    parseDOM: [
      {
        tag: "[data-j-type=topic]"
      }
    ],
    content: "title body?",
    toDOM() {
      return ['article', {}, 0]
    }
  },
  doc: {
    inline: false,
    parseDOM: [
      {
        tag: "[data-j-type=document]"
      }
    ],
    content: "topic",
    toDOM() {
      return ['div', {}, 0]
    }
  },
  ul: {
    inline: false,
    group: 'all_blocks',
    parseDOM: [
      {
        tag: "[data-j-type=ul]"
      }
    ],
    content: "li",
    toDOM() {
      return ['ul', {}, 0]
    }
  },
  ol: {
    inline: false,
    group: 'all_blocks',
    parseDOM: [
      {
        tag: "[data-j-type=ol]"
      }
    ],
    content: "li",
    toDOM() {
      return ['ol', {}, 0]
    }
  },
  li: {
    inline: false,
    parseDOM: [
      {
        tag: "[data-j-type=li]"
      }
    ],
    content: "all_blocks*",
    toDOM() {
      return ['li', {}, 0]
    }
  },
  fig: {
    inline: false,
    content: 'title? block_image',
    parseDOM: [
      {
        tag: "[data-j-type=fig]"
      }
    ],
    toDOM() {
      return ['fig', {}, 0]
    }
  },
  block_image: {
    inline: false,
    group: 'fig_blocks',
    parseDOM: [
      {
        tag: "[data-j-type=image]"
      }
    ],
    toDOM(node: Node) {
      return ["img", { src: node.attrs.src }];
    }
  },
  image: {
    inline: true,
    group: 'inline',
    parseDOM: [
      {
        tag: "[data-j-type=image]"
      }
    ],
    toDOM(node: Node) {
      return ["img", { src: node.attrs.src }];
    }
  },
}