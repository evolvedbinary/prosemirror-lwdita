import { assert, expect } from 'chai';
import { defaultNodeAttrs, defaultNodeName, defaultToDom, getChildren, getDomAttr, schema, travel } from '../schema';
import { TextNode, BaseNode, TopicNode, DdNode, nodeGroups } from 'jdita';
import { Schema } from 'prosemirror-model';

/**
 * Unit test for `travel()`
 * on `TextNode`
 *
 * @privateRemarks
 * Do we need tests for other NodeTypes?
 */
describe('Schema', () => {
  it('Text node', () => {
    assert.deepEqual(travel(TextNode as unknown as typeof BaseNode, console.log), { attrs: { parent: { default: '' } }} as any);
  });
});

describe('getChildren', () => {
  it('Should return children for regular node', () => {
    const type = TopicNode.childTypes;
    const children = getChildren(type);
    assert.deepEqual(children, ["title","shortdesc","prolog","body"]);
  });

  it('Should return children for node with group children', () => {
    // DD node children are %list-blocks
    const type = DdNode.childTypes;
    const children = getChildren(type);
    // %list-blocks are p  ul  ol  dl  pre  audio  video  simpletable  fig  note  data
    assert.deepEqual(children, ['p', 'ul', 'ol', 'dl', 'pre', 'audio', 'video', 'simpletable', 'fig', 'note', 'data']);
  });
});

describe('defaultToDom', () => {
  it('should get dom node', () => {
    const node = {
      nodeName: 'topic',
      attrs: {
        parent: 'parentValue',
        attr1: 'attr1Value',
        attr2: 'attr2Value',
      },
    };
    const attrs = {
      attr1: 'data-attr1',
      attr2: 'data-attr2',
    };
    const toDom = defaultToDom(BaseNode, attrs);
    const result = toDom(node as any);
    const expected = [
      'jdita-node-node',
      {
        'data-j-type': 'node',
        'data-attr1': 'attr1Value',
        'data-attr2': 'attr2Value',
      },
      0,
    ];
    // TODO correct this assertion
    // assert.deepEqual(result, expected as DOMOutputSpec);
  });
});

describe('getDomAttr', () => {
  it('Id dom attribute for topic', () => {
    const nodeName = 'topic';
    const attrs = "id";
    const domAttrs = getDomAttr(nodeName, attrs);
    assert.equal(domAttrs, "data-j-id");
  });
});

describe('defaultNodeAttrs', () => {
  it('should return default node attributes', () => {
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

describe('defaultNodeName', () => {
  it('should return default node name', () => {
    const nodeName = 'topic';
    const result = defaultNodeName(nodeName);
    const expected = 'topic';
    assert.equal(result, expected);
  });

  it('should return default node name with hyphen', () => {
    const nodeName = 'media-autoplay';
    const result = defaultNodeName(nodeName);
    const expected = 'media_autoplay';
    assert.equal(result, expected);
  });
});

describe('schema', () => {
  it('should return a valid schema', () => {
    const result = schema();
    assert.instanceOf(result, Schema);
  });
  
  it('should generate schema with marks property', () => {
    const result = schema();
    expect(result).to.have.property('marks');
  });


  it('should generate schema with nodes property', () => {
    const result = schema();
        
    expect(result).to.have.property('nodes');
  });

  //TODO add more tests for schema

});