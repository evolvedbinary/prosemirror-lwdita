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
import { schema } from "../schema";
import { _test_private_commands, createNode, createNodesTree } from '../commands';

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
