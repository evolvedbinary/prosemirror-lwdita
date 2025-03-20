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

import { assert, expect } from 'chai';
import { defaultNodeAttrs, defaultNodeName, defaultToDom, getDomAttr, schema, _test_private_schema, SchemaNode } from '../src/schema';
import { DOMOutputSpec, MarkSpec, NodeSpec, Schema } from 'prosemirror-model';
import { createNode } from '../src/commands';
import { AbstractBaseNode, DdNode, TextNode, TopicNode } from '@evolvedbinary/lwdita-ast';

/**
 * Unit tests for `schema.ts`
 */

describe('Function schemaTravel()', () => {
  it('returns correct attributes for a TextNode', () => {
    assert.deepEqual(_test_private_schema.schemaTravel(TextNode as unknown as typeof AbstractBaseNode, console.log), { attrs: { parent: { default: '' } }} as SchemaNode);
  });
});

describe('Function getChildren()', () => {
  it('makes sure that the node type gets the correct children according to the schema', () => {
    const type = TopicNode.childTypes;
    const children = _test_private_schema.getChildren(type);
    assert.deepEqual(children, [
      { name: 'title', required: true, single: true },
      { name: 'shortdesc', required: false, single: true },
      { name: 'prolog', required: false, single: true },
      { name: 'body', required: false, single: true },
    ]);
  });

  it('makes sure that the node type gets the correct group node children according to the schema', () => {
    // DD node children are %list-blocks
    const type = DdNode.childTypes;
    const children = _test_private_schema.getChildren(type);
    // %list-blocks are 'p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note'
    assert.deepEqual(children, [
      { name: 'p', required: false, single: false },
      { name: 'ul', required: false, single: false },
      { name: 'ol', required: false, single: false },
      { name: 'dl', required: false, single: false },
      { name: 'pre', required: false, single: false },
      { name: 'audio', required: false, single: false },
      { name: 'video', required: false, single: false },
      { name: 'example', required: false, single: false },
      { name: 'simpletable', required: false, single: false },
      { name: 'fig', required: false, single: false },
      { name: 'note', required: false, single: false },
    ]);
  });
});

describe('Function defaultToDom()', () => {
  it('returns a function that generates the dom spec for a node', () => {
    const attrs = {};
    const toDom = defaultToDom(AbstractBaseNode, attrs);

    const type = schema().nodes.block_li;
    const node = createNode(type, {});
    const result = toDom(node);
    const expected = [
      'jdita-node-node',
      {
        'data-j-type': 'node',
      },
      0,
    ];
    assert.deepEqual(result, expected as unknown as DOMOutputSpec);
  });
});

describe('Function getDomAttr()', () => {
  it('returns the dom attribute "Id" for nodeName "topic"', () => {
    const nodeName = 'topic';
    const attrs = "id";
    const domAttrs = getDomAttr(nodeName, attrs);
    assert.equal(domAttrs, "data-j-id");
  });
});

describe('Function defaultNodeAttrs()', () => {
  it('creates default node attributes', () => {
    const attrs = ['attr1', 'attr2', 'attr3'];
    const result = defaultNodeAttrs(attrs);
    const expected = {
      attr1: { default: '' },
      attr2: { default: '' },
      attr3: { default: '' },
    };
    assert.deepEqual(result, expected);
  });
});

describe('Function defaultNodeName()', () => {
  it('preserves the nodeName "topic" without any tranformation as it is', () => {
    const nodeName = 'topic';
    const result = defaultNodeName(nodeName);
    const expected = 'topic';
    assert.equal(result, expected);
  });

  it('replaces hyphens occurring in a nodeName into an underscore', () => {
    const nodeName = 'media-autoplay';
    const result = defaultNodeName(nodeName);
    const expected = 'media_autoplay';
    assert.equal(result, expected);
  });
});

describe('Function schema()', () => {
  let result: Schema;
  before(() => {
    result = schema();
    //console.log('schema= ', result)
  });

  it('is the correct instance of class "Schema"', () => {
    assert.instanceOf(result, Schema);
  });

  it('contains the "marks" property', () => {
    expect(result).to.have.property('marks');
  });

  it('contains "nodes" property', () => {
    expect(result).to.have.property('nodes');
  });

  it('contains all JDita nodes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes = result.spec.nodes as any;
    // nodeNames are strings in the content array
    const nodeNames = nodes.content.filter((node: NodeSpec) => typeof node === 'string')

    const expectedNodes = [
        "text",
        "block_alt",
        "image",
        "xref",
        "tt",
        "strong",
        "ph",
        "em",
        "block_title",
        "block_shortdesc",
        "block_othermeta",
        "block_metadata",
        "block_prolog",
        "block_p",
        "block_ol",
        "block_dt",
        "block_pre",
        "block_desc",
        "block_image",
        "block_video_poster",
        "block_media_source",
        "block_media_track",
        "block_video",
        "block_stentry",
        "block_sthead",
        "block_strow",
        "block_simpletable",
        "block_xref",
        "block_fig",
        "block_example",
        "block_note",
        "block_fallback",
        "block_audio",
        "block_dd",
        "block_dlentry",
        "block_dl",
        "block_li",
        "block_ul",
        "block_section",
        "block_fn",
        "block_div",
        "block_body",
        "block_topic",
        "doc",
        "block_navtitle",
        "block_keytext",
        "block_topicmeta",
        "block_topicref",
        "block_keydef",
        "block_map",
    ];

    expect(nodeNames).to.have.members(expectedNodes);
  });

  it('returns node specs with schema-compliant children', () => {
    const nodes = result.spec.nodes as NodeSpec;
    const nodesObject = {} as NodeSpec;
    if(!nodes.content) return;
    for(let i=0; i<nodes.content.length; i+=2) {
      nodesObject[nodes.content[i]] = nodes.content[i+1];
    }

    // topic node
    expect(nodesObject['block_topic'].content).to.equal('block_title block_shortdesc? block_prolog? block_body?');

    // dd node
    expect(nodesObject['block_dd'].content).to.equal("block_p* block_ul* block_ol* block_dl* block_pre* block_audio* block_video* block_example* block_simpletable* block_fig* block_note*");

    // title node
    expect(nodesObject['block_title'].content).to.equal("text* em* ph* strong* tt* image*");
  });

  it('returns a node spec with a schema-compliant inline property', () => {
    const nodes = result.spec.nodes as NodeSpec;
    const nodesObject = {} as NodeSpec;
    if(!nodes.content) return;
    for(let i=0; i < nodes.content.length; i+=2) {
      nodesObject[nodes.content[i]] = nodes.content[i+1];
    }

    // topic node
    expect(nodesObject['block_topic'].inline).to.equal(false);

    // dd node
    expect(nodesObject['block_dd'].inline).to.equal(false);

    // title node
    expect(nodesObject['block_title'].inline).to.equal(false);

    // text node
    expect(nodesObject['text'].inline).to.equal(true);
  });

  it('returns a node spec with a schema-compliant node attribute', () => {
    const nodes = result.spec.nodes as NodeSpec;
    const nodesObject = {} as NodeSpec;
    if(!nodes.content) return;
    for(let i=0; i< nodes.content.length; i+=2) {
      nodesObject[nodes.content[i]] = nodes.content[i+1];
    }

    // topic node
    expect(nodesObject['block_topic'].attrs).to.have.keys(
      'id',
      'xmlns:ditaarch',
      'ditaarch:DITAArchVersion',
      'specializations',
      'outputclass',
      'translate',
      'dir',
      'parent',
      'class',
      'xml:lang'
    );

    // body node
    expect(nodesObject['block_body'].attrs).to.have.keys(
      'parent',
      'dir',
      'xml:lang',
      'translate',
      'outputclass',
      'class'
    );

    // title node
    expect(nodesObject['block_title'].attrs).to.have.keys(
      'parent',
      'dir',
      'xml:lang',
      'translate',
      'outputclass',
      'class'
    );
  });

  it('contains all expected marks', () => {
    const marks = result.spec.marks as MarkSpec;
    const specMarks = marks.content.filter((node: MarkSpec) => typeof node === 'string')
    const expectedMarks = [ 'sup', 'sub', 'u', 'i', 'b' ];
    expect(specMarks).to.have.members(expectedMarks);
  });

});