/**
 * Unit tests for command.ts
 */

import { expect } from "chai";
import { schema } from "../schema";
import {canCreate, canCreateIndex, createNode, createNodesTree} from '../commands'
const schemaObject = schema();
/*
// Pass all 12 NodeTypes from the schema
// and test against their expected returned nodes
createNode()

// Pass sample NodeType tree
// and test against expected node object
createNodesTree()

// Pass a NodeType OL or UL
// and test against expected command
insertNode()

// Pass NodeType, InputContainer,
// an EditorState, and a transaction object
// and test against expected command
insertImage()

// Pass a NodeType
// and test against expected node index number
canCreateIndex()

// Pass a NodeType and test against expected Boolean
canCreate()

// Pass a ResolvedPos object
// and test against expected list of NodeTypes
defaultBlocks()

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