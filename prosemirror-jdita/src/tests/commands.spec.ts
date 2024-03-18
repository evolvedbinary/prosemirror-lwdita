/**
 * Unit tests for command.ts
 */

import { expect } from "chai";
import { schema } from "../schema";
import {canCreate, canCreateIndex, createNode, createNodesTree, insertNode} from '../commands'
import { EditorState } from "prosemirror-state";
import { Node } from "prosemirror-model";

const schemaObject = schema();
/*

// Pass NodeType, InputContainer,
// an EditorState, and a transaction object
// and test against expected command
insertImage()

// Pass a ResolvedPos object and an allowed NodeType
// and test against the expected NodeType
defaultBlockAt()

// Pass a transaction object
// and test against expected Boolean
enterEOL()

// Pass a transaction object
// and test against expected transaction object
deleteEmptyLine()

// Pass a transaction object
// and test against expected transaction of enterEOL()
enterEmpty()

// Pass a transaction object
// and test against expected Boolean
enterSplit()

// Pass a transaction object
// and test against expected Boolean
isEOL()

// Pass a transaction object
// and test against expected Boolean
isEmpty()

// Pass a transaction object
// and test against expected Boolean
isPrevEmpty()

// Pass a transaction object
// and test against expected number
getDepth()

// Pass a transaction object
// and test against expected number
getPrevDepth()

// Pass a ResolvedPos object
// and test against expected array of NodeTypes
getTree()

// Pass an EditorState object, a transaction object,
// a ResolvedPos object
// and test against expected Boolean
enterPressed()

// Pass an EditorState object and a MarkType
// and test against expected Boolean
hasMark()
*/

describe('createNode', () => {
  it('creates a node', () => {
    const type = schemaObject.nodes.p;

    const node = createNode(type);
    expect(node.type.name).to.equal('p');
  });

  it('creates a node and fills it with content', () => {
    const type = schemaObject.nodes.ul;
    const node = createNode(type, {});
    let li = node.content.firstChild;
    let p = li?.content.firstChild;

    expect(li?.type.name).to.equal('li');
    expect(p?.type.name).to.equal('p');
  });

  it('throws on unknown node type', () => {
    const type = schemaObject.nodes.unknown;
    expect(() => createNode(type)).to.throw();
  });

})

// Pass a NodeType tree
// and test against expected node name
describe('createNodesTree', () => {
  it('creates a node tree', () => {
    const nodeTypes = [schemaObject.nodes.p, schemaObject.nodes.li, schemaObject.nodes.ul];

    const node = createNodesTree(nodeTypes);


    let li = node.content.firstChild;
    let p = li?.content.firstChild;

    expect(li?.type.name).to.equal('li');
    expect(p?.type.name).to.equal('p');

  });
});

// Pass a NodeType
// and test against expected node index number
describe('canCreateIndex', () => {
  it('correct index for allowed node types', () => {
    const knownTypes = [schemaObject.nodes.data, schemaObject.nodes.ul, schemaObject.nodes.li, schemaObject.nodes.p, schemaObject.nodes.section, schemaObject.nodes.stentry, schemaObject.nodes.strow, schemaObject.nodes.simpletable]
    knownTypes.forEach((type) => {
      const index = canCreateIndex(type);
      expect(index).to.equal(knownTypes.indexOf(type));
    });
  });

  it('-1 for denied node types', () => {
    const index = canCreateIndex(schemaObject.nodes.xref);
    expect(index).to.equal(-1);
  });
});

// Pass a NodeType and test against expected Boolean
describe('canCreate', () => {
  it('true for allowed types', () => {
    const knownTypes = [schemaObject.nodes.data, schemaObject.nodes.ul, schemaObject.nodes.li, schemaObject.nodes.p, schemaObject.nodes.section, schemaObject.nodes.stentry, schemaObject.nodes.strow, schemaObject.nodes.simpletable]
    knownTypes.forEach((type) => {
      const result = canCreate(type);
      expect(result).to.be.true;
    });
  });

  it('false for denied node types', () => {
    const result = canCreate(schemaObject.nodes.xref);
    expect(result).to.be.false;
  });
});

describe('insertNode', () => {
  it('insertNode', () => {
    const type = schemaObject.nodes.p;
    const command = insertNode(type);

    const jsonDoc = `{ "type": "doc", "attrs": {}, "content": [ { "type": "topic", "attrs": { "parent": "doc" }, "content": [ { "type": "title", "attrs": { "parent": "topic" }, "content": [ { "type": "text", "text": "title", "attrs": { "parent": "title" } } ] }, { "type": "body", "attrs": { "parent": "topic" }, "content": [ { "type": "section", "attrs": { "parent": "body" }, "content": [ { "type": "p", "attrs": { "parent": "section" }, "content": [ { "type": "text", "text": "text content", "attrs": { "parent": "p" } } ] } ] } ] } ] } ] }`;

    const doc = Node.fromJSON(schemaObject, JSON.parse(jsonDoc));

    const state = EditorState.create({
      doc
    })
    const dispatch = () => {};

    const result = command(state as unknown as EditorState, dispatch);
    console.log(result);

  });
});