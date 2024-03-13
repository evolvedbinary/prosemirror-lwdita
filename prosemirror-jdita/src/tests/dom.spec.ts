import { assert } from 'chai';
import { getDomNode } from '../dom';

/**
 * Unit tests for dom.ts
 *
 * getDomNode()
 * Pass a JDita node name and test against expected HTML node name
 */
describe('getDomNode()', () => {
  let domNode: string;

  describe('when passed a JDita node name "topic"', () => {
    it('returns the according HTML node name "article"', () => {
      domNode = getDomNode('topic', 'doc');
      assert.deepEqual(domNode, 'article');
    });
  });

  describe('when passed a JDita node name "title"', () => {
    it('returns the according HTML node name "h1"', () => {
      domNode = getDomNode('title', 'topic');
      assert.deepEqual(domNode, 'h1');
    });
  });

  describe('when passed a JDita node name "media-source"', () => {
    it('returns the according HTML node name "source"', () => {
      domNode = getDomNode('media-source', 'video');
      assert.deepEqual(domNode, 'source');
    });
  });
});
