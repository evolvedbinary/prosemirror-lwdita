import { assert } from 'chai';
import { travel } from './schema';
import { TextNode, BaseNode } from 'jdita';

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
