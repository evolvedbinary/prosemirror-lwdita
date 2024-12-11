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

/**
 * Unit tests for command.ts
 */

import { expect } from "chai";
import { schema, SCHEMA_CONTENT } from "../src/schema";
import { _test_private_commands, createNode, createNodesTree } from '../src/commands';

const schemaObject = schema();

describe('Function createNode()', () => {
  it('creates a node', () => {
    const type = schemaObject.nodes.p;

    const node = createNode(type);
    expect(node.type.name).to.equal('p');
  });

  it('creates a node and fills it with content', () => {
    const type = schemaObject.nodes.ul;
    const node = createNode(type, {});
    const li = node.content.firstChild;
    const p = li?.content.firstChild;

    expect(li?.type.name).to.equal('li');
    expect(p?.type.name).to.equal('p');
  });

  it('throws an error on an unknown node type', () => {
    const type = schemaObject.nodes.unknown;
    expect(() => createNode(type)).to.throw();
  });

})

// Pass a NodeType tree
// and test against expected node name
describe('Function createNodesTree()', () => {
  it('creates a node tree', () => {
    const nodeTypes = [
      schemaObject.nodes.p,
      schemaObject.nodes.li,
      schemaObject.nodes.ul
    ];

    const node = createNodesTree(nodeTypes);
    const li = node.content.firstChild;
    const p = li?.content.firstChild;

    expect(li?.type.name).to.equal('li');
    expect(p?.type.name).to.equal('p');

  });
});

// Pass a NodeType
// and test against expected node index number
describe('Function canCreateIndex()', () => {
  it('returns the correct index for allowed node types ul, li, p, section, stentry, strow, simpletable', () => {
    const knownTypes = [
      schemaObject.nodes.ul,
      schemaObject.nodes.li,
      schemaObject.nodes.p,
      schemaObject.nodes.section,
      schemaObject.nodes.stentry,
      schemaObject.nodes.strow,
      schemaObject.nodes.simpletable
    ]
    knownTypes.forEach((type) => {
      const index = _test_private_commands.canCreateIndex(type);
      expect(index).to.equal(knownTypes.indexOf(type));
    });
  });

  it('returns index "-1" for denied node types', () => {
    const index = _test_private_commands.canCreateIndex(schemaObject.nodes.xref);
    expect(index).to.equal(-1);
  });
});

// Pass a NodeType and test against expected Boolean
describe('Function canCreate()', () => {
  it('returns "true" for allowed types', () => {
    const knownTypes = [
      schemaObject.nodes.ul,
      schemaObject.nodes.li,
      schemaObject.nodes.p,
      schemaObject.nodes.section,
      schemaObject.nodes.stentry,
      schemaObject.nodes.strow,
      schemaObject.nodes.simpletable
    ]
    knownTypes.forEach((type) => {
      const result = _test_private_commands.canCreate(type);
      expect(result).to.be.true;
    });
  });

  it('returns "false" for denied node types', () => {
    const result = _test_private_commands.canCreate(schemaObject.nodes.xref);
    expect(result).to.be.false;
  });
});

// describe.skip('getPossibleNextSiblingTypes function', () => {
//   it('returns the possible children for p', () => {
//     const content = SCHEMA_CONTENT['p'][0];
//     const result = _test_private_commands.getPossibleNextSiblingTypes(content);
//     expect(result).to.deep.equal([`cdata`, `text`, `b`, `em`, `i`, `ph`, `strong`, `sub`, `sup`, `tt`, `u`, `image`, `xref`]);
//   });

//   it('returns the possible children for ul', () => {
//     const content = SCHEMA_CONTENT['ul'][0];
//     const result = _test_private_commands.getPossibleNextSiblingTypes(content);
//     expect(result).to.deep.equal([`li`]);
//   });

//   it('returns the possible children for li', () => {
//     const content = SCHEMA_CONTENT['li'][0];
//     const result = _test_private_commands.getPossibleNextSiblingTypes(content);
//     expect(result).to.deep.equal(['p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note']);
//   });

//   it('returns the possible children for topic', () => {
//     const content = SCHEMA_CONTENT['topic'][0];
//     const result = _test_private_commands.getPossibleNextSiblingTypes(content);
//     expect(result).to.deep.equal(['title', 'shortdesc', 'prolog', 'body']);
//   });

//   it('returns the possible children for body', () => {
//     const content = SCHEMA_CONTENT['body'][0];
//     const result = _test_private_commands.getPossibleNextSiblingTypes(content);
//     expect(result).to.deep.equal(['p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note', 'section', 'div']);
//   });

//   //alt
//   it('returns the possible children for alt', () => {
//     const content = SCHEMA_CONTENT['alt'][0];
//     const result = _test_private_commands.getPossibleNextSiblingTypes(content);
//     expect(result).to.deep.equal(['cdata', 'text', 'b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u']);
//   });
// });

// describe.only('getPossibleNextSiblingTypes function', () => {
//   it('returns the possible children for p', () => {
//     const nodeType = schemaObject.nodes.p;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal([ "text", "image", "xref", "b", "em", "i", "ph", "strong", "sub", "sup", "tt", "u" ]);
//   });

//   it('returns the possible children for ul', () => {
//     const nodeType = schemaObject.nodes.ul;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal([`li`]);
//   });

//   it('returns the possible children for li', () => {
//     const nodeType = schemaObject.nodes.li;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal([ "p", "ol", "pre", "video", "simpletable", "fig", "example", "note", "audio", "dl", "ul" ]);
//   });

//   it('returns the possible children for topic', () => {
//     const nodeType = schemaObject.nodes.topic;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal(['title', 'shortdesc', 'prolog', 'body']);
//   });

//   it('returns the possible children for body', () => {
//     const nodeType = schemaObject.nodes.body;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal(['p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note', 'section', 'div']);
//   });

//   //alt
//   it('returns the possible children for alt', () => {
//     const nodeType = schemaObject.nodes.alt;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal(['text', 'b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u']);
//   });

//   //section
//   it('returns the possible children for section', () => {
//     const nodeType = schemaObject.nodes.section;
//     const result = _test_private_commands.getPossibleNextSiblingTypes(nodeType);
//     expect(result).to.deep.equal(['p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note', 'title']);
//   });
// });


// this is for the third version
describe.only('getPossibleNextSiblingTypes function', () => {
  it('returns the possible children for p', () => {
    const pType = schemaObject.nodes.p;

    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(pType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
  
    expect(result).to.deep.equal([`text`, `image`, `xref`, `ph`]);
  });

  it('returns the possible children for ul', () => {
    const ulType = schemaObject.nodes.ul;
    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(ulType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
    expect(result).to.deep.equal([`li`]);
  });

  it('returns the possible children for li', () => {
    const liType = schemaObject.nodes.li;
    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(liType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
    expect(result).to.deep.equal([ "p", "ol", "pre", "video", "simpletable", "fig", "example", "note", "audio", "dl", "ul" ]);
  });

  it('returns the possible children for topic', () => {
    // this is broken, as it only returns 'title' and that's all
    const topicType = schemaObject.nodes.topic;
    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(topicType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
    expect(result).to.deep.equal(['title', 'shortdesc', 'prolog', 'body']);
  });

  it('returns the possible children for body', () => {
    const bodyType = schemaObject.nodes.body;
    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(bodyType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
    // ((%list-blocks;)*, section*, div?) 
    expect(result).to.deep.equal([ "div", "section", "p", "ol", "pre", "video", "simpletable", "fig", "example", "note", "audio", "dl", "ul" ]);
  });

  //alt
  it('returns the possible children for alt', () => {
    const altType = schemaObject.nodes.alt;
    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(altType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
  
    expect(result).to.deep.equal(['text', 'ph']);
  });

  //section
  it('returns the possible children for section', () => {
    const sectionType = schemaObject.nodes.section;
    const nodeTypes = _test_private_commands.getPossibleNextSiblingTypes(sectionType);
    const result = nodeTypes.map((nodeType) => nodeType.name);
    // this is equivalent to title? %all-blocks*
    expect(result).to.deep.equal([ "p", "ol", "pre", "video", "simpletable", "fig", "example", "note", "audio", "dl", "ul", "title"]);
  });
});