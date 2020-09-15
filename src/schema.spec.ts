import { assert } from 'chai';
import { travel } from './schema';
import { TextNode, BaseNode } from 'jdita';

describe.skip('Prosemirror objects', () => {
  it('Schema', () => {
    assert.deepEqual(travel(TextNode as unknown as typeof BaseNode, console.log), {} as any);
  });
});
