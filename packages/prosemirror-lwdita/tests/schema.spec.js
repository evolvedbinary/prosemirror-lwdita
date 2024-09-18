"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const schema_1 = require("../schema");
const prosemirror_model_1 = require("prosemirror-model");
const commands_1 = require("../commands");
const lwdita_ast_1 = require("@evolvedbinary/lwdita-ast");
/**
 * Unit tests for `schema.ts`
 */
describe('Function schemaTravel()', () => {
    it('returns correct attributes for a TextNode', () => {
        chai_1.assert.deepEqual(schema_1._test_private_schema.schemaTravel(lwdita_ast_1.TextNode, console.log), { attrs: { parent: { default: '' } } });
    });
});
describe('Function getChildren()', () => {
    it('makes sure that the node type gets the correct children according to the schema', () => {
        const type = lwdita_ast_1.TopicNode.childTypes;
        const children = schema_1._test_private_schema.getChildren(type);
        chai_1.assert.deepEqual(children, ["title", "shortdesc", "prolog", "body"]);
    });
    it('makes sure that the node type gets the correct group node children according to the schema', () => {
        // DD node children are %list-blocks
        const type = lwdita_ast_1.DdNode.childTypes;
        const children = schema_1._test_private_schema.getChildren(type);
        // %list-blocks are 'p','ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note'
        chai_1.assert.deepEqual(children, ['p', 'ul', 'ol', 'dl', 'pre', 'audio', 'video', 'example', 'simpletable', 'fig', 'note']);
    });
});
describe('Function defaultToDom()', () => {
    it('returns a function that generates the dom spec for a node', () => {
        const attrs = {};
        const toDom = (0, schema_1.defaultToDom)(lwdita_ast_1.AbstractBaseNode, attrs);
        const type = (0, schema_1.schema)().nodes.li;
        const node = (0, commands_1.createNode)(type, {});
        const result = toDom(node);
        const expected = [
            'jdita-node-node',
            {
                'data-j-type': 'node',
            },
            0,
        ];
        chai_1.assert.deepEqual(result, expected);
    });
});
describe('Function getDomAttr()', () => {
    it('returns the dom attribute "Id" for nodeName "topic"', () => {
        const nodeName = 'topic';
        const attrs = "id";
        const domAttrs = (0, schema_1.getDomAttr)(nodeName, attrs);
        chai_1.assert.equal(domAttrs, "data-j-id");
    });
});
describe('Function defaultNodeAttrs()', () => {
    it('creates default node attributes', () => {
        const attrs = ['attr1', 'attr2', 'attr3'];
        const result = (0, schema_1.defaultNodeAttrs)(attrs);
        const expected = {
            attr1: { default: '' },
            attr2: { default: '' },
            attr3: { default: '' },
        };
        chai_1.assert.deepEqual(result, expected);
    });
});
describe('Function defaultNodeName()', () => {
    it('preserves the nodeName "topic" without any tranformation as it is', () => {
        const nodeName = 'topic';
        const result = (0, schema_1.defaultNodeName)(nodeName);
        const expected = 'topic';
        chai_1.assert.equal(result, expected);
    });
    it('replaces hyphens occurring in a nodeName into an underscore', () => {
        const nodeName = 'media-autoplay';
        const result = (0, schema_1.defaultNodeName)(nodeName);
        const expected = 'media_autoplay';
        chai_1.assert.equal(result, expected);
    });
});
describe('Function schema()', () => {
    let result;
    before(() => {
        result = (0, schema_1.schema)();
        //console.log('schema= ', result)
    });
    it('is the correct instance of class "Schema"', () => {
        chai_1.assert.instanceOf(result, prosemirror_model_1.Schema);
    });
    it('contains the "marks" property', () => {
        (0, chai_1.expect)(result).to.have.property('marks');
    });
    it('contains "nodes" property', () => {
        (0, chai_1.expect)(result).to.have.property('nodes');
    });
    it('contains all JDita nodes', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nodes = result.spec.nodes;
        // nodeNames are strings in the content array
        const nodeNames = nodes.content.filter((node) => typeof node === 'string');
        const expectedNodes = [
            'alt', 'audio', 'body',
            'dd', 'desc', 'div',
            'dl', 'dlentry', 'doc',
            'dt', 'em', 'example',
            'fallback', 'fig', 'fn',
            'hard_break', 'image', 'keydef',
            'keytext', 'li', 'map',
            'media_source', 'media_track', 'metadata',
            'navtitle', 'note', 'ol',
            'othermeta', 'p', 'ph',
            'pre', 'prolog', 'section',
            'shortdesc', 'simpletable', 'stentry',
            'sthead', 'strong', 'strow',
            'text', 'title', 'topic',
            'topicmeta', 'topicref', 'tt',
            'ul', 'video', 'video_poster',
            'xref'
        ];
        (0, chai_1.expect)(nodeNames).to.have.members(expectedNodes);
    });
    it('returns node specs with schema-compliant children', () => {
        const nodes = result.spec.nodes;
        const nodesObject = {};
        if (!nodes.content)
            return;
        for (let i = 0; i < nodes.content.length; i += 2) {
            nodesObject[nodes.content[i]] = nodes.content[i + 1];
        }
        // topic node
        (0, chai_1.expect)(nodesObject['topic'].content).to.equal('title shortdesc? prolog? body?');
        // dd node
        (0, chai_1.expect)(nodesObject['dd'].content).to.equal('list_blocks*');
        // title node
        (0, chai_1.expect)(nodesObject['title'].content).to.equal('inline_noxref*');
    });
    it('returns a node spec with a schema-compliant inline property', () => {
        const nodes = result.spec.nodes;
        const nodesObject = {};
        if (!nodes.content)
            return;
        for (let i = 0; i < nodes.content.length; i += 2) {
            nodesObject[nodes.content[i]] = nodes.content[i + 1];
        }
        // topic node
        (0, chai_1.expect)(nodesObject['topic'].inline).to.equal(true);
        // dd node
        (0, chai_1.expect)(nodesObject['dd'].inline).to.equal(true);
        // title node
        (0, chai_1.expect)(nodesObject['title'].inline).to.equal(true);
        // text node
        (0, chai_1.expect)(nodesObject['text'].inline).to.equal(true);
    });
    it('returns a node spec with a schema-compliant node attribute', () => {
        const nodes = result.spec.nodes;
        const nodesObject = {};
        if (!nodes.content)
            return;
        for (let i = 0; i < nodes.content.length; i += 2) {
            nodesObject[nodes.content[i]] = nodes.content[i + 1];
        }
        // topic node
        (0, chai_1.expect)(nodesObject['topic'].attrs).to.have.keys('id', 'xmlns:ditaarch', 'ditaarch:DITAArchVersion', 'specializations', 'outputclass', 'translate', 'dir', 'parent', 'class', 'xml:lang');
        // body node
        (0, chai_1.expect)(nodesObject['body'].attrs).to.have.keys('parent', 'dir', 'xml:lang', 'translate', 'outputclass', 'class');
        // title node
        (0, chai_1.expect)(nodesObject['title'].attrs).to.have.keys('parent', 'dir', 'xml:lang', 'translate', 'outputclass', 'class');
    });
    it('contains all expected marks', () => {
        const marks = result.spec.marks;
        const specMarks = marks.content.filter((node) => typeof node === 'string');
        const expectedMarks = ['sup', 'sub', 'u', 'i', 'b'];
        (0, chai_1.expect)(specMarks).to.have.members(expectedMarks);
    });
});
//# sourceMappingURL=schema.spec.js.map