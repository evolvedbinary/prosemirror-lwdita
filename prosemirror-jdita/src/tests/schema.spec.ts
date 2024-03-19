import { assert, expect } from 'chai';
import { defaultNodeAttrs, defaultNodeName, defaultToDom, getChildren, getDomAttr, schema, schemaTravel } from '../schema';
import { TextNode, BaseNode, TopicNode, DdNode, nodeGroups } from 'jdita';
import { DOMOutputSpec, Schema } from 'prosemirror-model';
import { createNode } from '../commands';

/**
 * Unit test for `schemaTravel()`
 * on `TextNode`
 *
 * @privateRemarks
 * Do we need tests for other NodeTypes?
 */
describe('Schema', () => {
  it('Text node', () => {
    assert.deepEqual(schemaTravel(TextNode as unknown as typeof BaseNode, console.log), { attrs: { parent: { default: '' } }} as any);
  });
});

describe('getChildren', () => {
  it('regular node children', () => {
    const type = TopicNode.childTypes;
    const children = getChildren(type);
    assert.deepEqual(children, ["title","shortdesc","prolog","body"]);
  });

  it('group node children', () => {
    // DD node children are %list-blocks
    const type = DdNode.childTypes;
    const children = getChildren(type);
    // %list-blocks are p  ul  ol  dl  pre  audio  video  simpletable  fig  note  data
    assert.deepEqual(children, ['p', 'ul', 'ol', 'dl', 'pre', 'audio', 'video', 'simpletable', 'fig', 'note', 'data']);
  });
});

describe('defaultToDom', () => {
  it('should get dom node', () => {
    const attrs = {};
    const toDom = defaultToDom(BaseNode, attrs);

    const type = schema().nodes.li;
    const node = createNode(type, {});
    const result = toDom(node as any);
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

describe('getDomAttr', () => {
  it('topic Id dom attribute', () => {
    const nodeName = 'topic';
    const attrs = "id";
    const domAttrs = getDomAttr(nodeName, attrs);
    assert.equal(domAttrs, "data-j-id");
  });
});

describe('defaultNodeAttrs', () => {
  it('adds default node attributes', () => {
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
  it('regular name', () => {
    const nodeName = 'topic';
    const result = defaultNodeName(nodeName);
    const expected = 'topic';
    assert.equal(result, expected);
  });

  it('name with hyphen', () => {
    const nodeName = 'media-autoplay';
    const result = defaultNodeName(nodeName);
    const expected = 'media_autoplay';
    assert.equal(result, expected);
  });
});

describe('schema', () => {
  let result: Schema;
  before(() => {
    result = schema();
  });

  it('typeof Schema', () => {
    assert.instanceOf(result, Schema);
  });
  
  it('contains marks property', () => {
    expect(result).to.have.property('marks');
  });


  it('contains nodes property', () => {

    expect(result).to.have.property('nodes');
  });

  it('all jdita nodes', () => {
    const nodes = result.spec.nodes as any; //orderedMap does not have content property so we had to cast it to any
    // nodeNames are strings in the content array
    const nodeNames = nodes.content.filter((node: any) => typeof node === 'string')
    const expectedNodes = [
      'text',         'image',       'data',
      'xref',         'ph',          'title',
      'shortdesc',    'prolog',      'p',
      'ol',           'dt',          'pre',
      'media_source', 'media_track', 'desc',
      'audio',        'video',       'fn',
      'note',         'stentry',     'sthead',
      'strow',        'simpletable', 'fig',
      'dd',           'dlentry',     'dl',
      'li',           'ul',          'section',
      'body',         'topic',       'doc'
    ];
    expect(nodeNames).to.have.members(expectedNodes);

  });

  it('nodes content', () => {
    const nodes = result.spec.nodes as any;
    const nodesObject = {} as any;
    for(let i=0; i<nodes.content.length; i+=2) {
      nodesObject[nodes.content[i]] = nodes.content[i+1];
    }

    // topic node
    expect(nodesObject['topic'].content).to.equal('title shortdesc? prolog? body?');

    // dd node
    expect(nodesObject['dd'].content).to.equal('list_blocks*');

    // title node
    expect(nodesObject['title'].content).to.equal('common_inline*');
  });

  it('inline nodes', () => {
    const nodes = result.spec.nodes as any;
    const nodesObject = {} as any;
    for(let i=0; i<nodes.content.length; i+=2) {
      nodesObject[nodes.content[i]] = nodes.content[i+1];
    }

    // topic node
    expect(nodesObject['topic'].inline).to.equal(true);

    // dd node
    expect(nodesObject['dd'].inline).to.equal(true);

    // title node
    expect(nodesObject['title'].inline).to.equal(true);

    // text node
    expect(nodesObject['text'].inline).to.equal(true);
  });

  it('nodes attributes', () => {
    const nodes = result.spec.nodes as any;
    const nodesObject = {} as any;
    for(let i=0; i<nodes.content.length; i+=2) {
      nodesObject[nodes.content[i]] = nodes.content[i+1];
    }

    // topic node
    expect(nodesObject['topic'].attrs).to.have.keys(
      'id',
      'domains',
      'outputclass',
      'translate',
      'dir',
      'parent',
      'class',
      'xml:lang',
      'xmlns:ditaarch',
      'ditaarch:DITAArchVersion'
    );

    // body node
    expect(nodesObject['body'].attrs).to.have.keys(
      'parent',
      'dir',
      'xml:lang',
      'translate',
      'outputclass',
      'class'
    );

    // title node
    expect(nodesObject['title'].attrs).to.have.keys(
      'parent',
      'dir',
      'xml:lang',
      'translate',
      'outputclass',
      'class'
    );
  });


  it('all marks', () => {
    const marks = result.spec.marks as any;
    const specMarks = marks.content.filter((node: any) => typeof node === 'string')
    const expectedMarks = [ 'sup', 'sub', 'u', 'i', 'b' ];
    expect(specMarks).to.have.members(expectedMarks);

  });

});