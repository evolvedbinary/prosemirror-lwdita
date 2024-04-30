import ChaiPromised from 'chai-as-promised';
import { use, expect, assert } from 'chai';
import { document, deleteUndefined, defaultTravel, travel, unTravel, NODES } from '../document';
import {
  JDITA_OBJECT,
  TRANSFORMED_JDITA_OBJECT,
  JDITA_NODE,
  JDITA_TRANFORMED_RESULT1,
  JDITA_TRANFORMED_RESULT2,
  PROSEMIRROR_DOC,
  JDITA_DOC
} from './test-utils';
import { JDita, xditaToJson } from 'jdita';

use(ChaiPromised);

/**
 * Unit tests for document.ts
 */

// Pass an object with undefined attributes
// and test against expected object
describe('Function deleteUndefined()', () => {
  it('removes undefined attributes from a passed object', () => {
    const attrs = {
      'dir': undefined,
      'xml:lang': undefined,
      'translate': undefined,
      'name': undefined,
      'value': 'movie.ogg',
      'parent': 'video'
    };

    const result = deleteUndefined(attrs);
    const expected = {
      value: 'movie.ogg',
      parent: 'video'
    };
    assert.deepEqual(result, expected);
  });
});

// Pass a JDita document node
// and test against expected Prosemirror document output
describe('Function defaultTravel()', () => {
  describe('when passed a JDITA node "title" and its parent node "topic"', () => {
    it('returns the transformed ProseMirror objects', () => {
      const node = JSON.parse(JDITA_NODE),
        expected = defaultTravel(node),
        result = (
          JSON.parse(JDITA_TRANFORMED_RESULT1),
          JSON.parse(JDITA_TRANFORMED_RESULT2)
        )
      assert.deepEqual(result, expected);
    });
  });
});

// Pass a JDita node
// and test against expected Prosemirror output
describe('Function travel()', () => {
  describe('when passed a JDITA "text" node and its parent node "title"', () => {
    it('returns a transformed ProseMirror object', () => {
      const node = JSON.parse('{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}'),
        parent = JSON.parse('{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]}'),
        expected = travel(node, parent),
        result = JSON.parse('{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}');
      assert.deepEqual(result, expected);
    });
  });

  describe('when passed a JDITA "topic" node and its parent node "doc"', () => {
    it('returns a transformed ProseMirror object', () => {
      const node = JSON.parse('{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}'),
        parent = JSON.parse('{"nodeName":"doc","children":[{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}]}'),
        expected = travel(node, parent),
        result = JSON.parse('{"type":"topic","attrs":{"id":"program","parent":"doc"},"content":[{"type":"title","attrs":{"parent":"topic"},"content":[{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}]},{"type":"body","attrs":{"parent":"topic"},"content":[{"type":"section","attrs":{"parent":"body"},"content":[{"type":"p","attrs":{"parent":"section"},"content":[{"type":"text","text":"You must assign a light bulb to at least one lighting group to operate that light bulb.","attrs":{"parent":"p"}}]}]}]}]}');
      assert.deepEqual(result, expected);
    });
  });
});

// Pass a JDita object
// and test against expected JDita transformation output
describe('Function document()', () => {
  it('returns a transformed Prosemirror object', () => {
    const transformedJdita = document(JSON.parse(JDITA_OBJECT));
    expect(transformedJdita).to.deep.equal(JSON.parse(TRANSFORMED_JDITA_OBJECT));
  });
});

// Pass a Prosemirror document
// and test against expected JDITA object
describe('Function unTravel()', () => {
  let expected: any, result: any;
  const doc = JSON.parse(PROSEMIRROR_DOC);

  describe('when passed a Prosemirror document', () => {

    it('returns a transformed JDITA object', () => {
      expected = JSON.parse(JDITA_DOC);
      result = unTravel(doc);
      assert.deepEqual(result, expected);
    });

    it.skip('handles simple jdita document', async () => {
      const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
      <topic id="program">
        <title>Test File 2</title>
        <body>
          <section>
            <p>A test paragraph.</p>
          </section>
        </body>
      </topic>`;

      // original jdita to compare against
      const originalJdita = await xditaToJson(inputXml);

      // process the jdita document and do the round trip
      //clean the attributes from the top node to compare
      originalJdita.attributes = {};
      // transform the jdita document
      const transformedJdita = document(originalJdita);
      // untransform the transformed jdita document
      const result = unTravel(transformedJdita);

      //compare the original jdita with the result
      expect(result).to.deep.equal(originalJdita);
    });

    it.skip('handles complex jdita document', async () => {
      const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
      <topic id="program-bulbs-to-groups">
        <title>Test File: Programming Light Bulbs to a Lighting Group</title>
        <shortdesc>You can program one or more light bulbs to a lighting group to operate that group
          with your remote control.</shortdesc>
        <body>
          <section id="context">
            <p>Your <ph keyref="product-name"/> remote control can manage up to <data>250 network light bulbs on the same lighting
            network</data>. When you add a light bulb to the network, you can program it to one or more
              lighting groups. You must assign a light bulb to at least one lighting group to
              operate that light bulb  A network light bulb that is not programmed to a
              lighting group will still operate when controlling all network light bulbs from
              the remote control.</p>
          </section>
          <section id="steps">
         <ol>
           <li><p>Make sure your remote control is in range of the light bulbs you are
              adding.</p></li>
           <li><p>If a network light bulb is new, you must install it by performing the following
                steps:</p>
                <ol>
                  <li><p>Make sure power to the fixture where you are installing the light bulb
                    is turned OFF.</p>
                  </li>
                    <li><p>Remove any existing light bulb from the light fixture.</p></li>
                    <li><p>Install the network light bulb into the light fixture as you would any
                    standard light bulb.</p></li>
                    <li><p>Turn power to the light fixture on.</p>
                    <p>The light bulb begins to brighten and dim while finding the
                    remote control's network.</p></li>
                <li><p>Repeat steps for each new network light bulb.</p></li>
                </ol></li>
              <li><p>Turn power on to the fixtures containing network light bulbs you want added to
                the light group.</p></li>
                <li><p>Turn power off to the fixtures containing light bulbs you do not want added to
                the light group. </p></li>
                <li><p>On the remote control, press and hold the desired lighting group button for 5
                seconds.</p>
              <p>The button indicator for the selected lighting group flashes green while
                the light bulb(s) are added to the group. If the indicator flashes red, the
                lighting group was not activated and you must try again. Light flashes red for 3
                seconds if programming fails.</p>
            </li>
            <li><p>Leave the light fixture switches ON so that power is available when using your
                remote control to turn the light bulbs on and off.</p></li>
            <li><p>remember to turn on any excluded fixtures that you turned off.</p></li>
          </ol>
          </section>
      
        </body>
      </topic>
      `;

      // original jdita to compare against
      const originalJdita = await xditaToJson(inputXml);

      // process the jdita document and do the round trip
      //clean the attributes from the top node to compare
      originalJdita.attributes = {};
      // transform the jdita document
      const transformedJdita = document(originalJdita);
      // untransform the transformed jdita document
      const result = unTravel(transformedJdita);

      //compare the original jdita with the result
      expect(result).to.deep.equal(originalJdita);

    });

    // this test shows the missing elements
    it.skip('handles jdita document with video', async () => {
      const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
      <topic id="program-bulbs-to-groups">
        <title>Test File: Media Elements in XDita</title>
        <body>
      
          <section id="demo">
            <title>
              Video Element
            </title>
            <fig>
              <video outputclass="videoElement" width="640" height="360">
                <desc>Xiaomi Yeelight YLDP06YL Smart Light Bulb White</desc>
                <video-poster value="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm/120px--1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm.jpg" />
                <media-controls name="controls" value="true"/>
                <media-source value="https://commons.wikimedia.org/wiki/File:1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm" />
              </video>
              </fig>
          </section>
        </body>
      </topic>`;

      // original jdita to compare against
      const originalJdita = await xditaToJson(inputXml);

      // process the jdita document and do the round trip
      //clean the attributes from the top node to compare
      originalJdita.attributes = {};
      // transform the jdita document
      const transformedJdita = document(originalJdita);
      // untransform the transformed jdita document
      const result = unTravel(transformedJdita);

      //compare the original jdita with the result
      expect(result).to.deep.equal(originalJdita);
    });

    // this test shows the missing elements
    it.skip('handles jdita document with audio', async () => {
      const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
          <topic id="program-bulbs-to-groups">
            <title>Test File: Media Elements in XDita</title>
            <body>
          
            <section>
            <title>Audio Element</title>
            <fig>
              <audio outputclass="audioElement">
                <desc>An Audio Track</desc>
                <media-controls name="controls" value="true"/>
                <media-source value="https://commons.wikimedia.org/wiki/File:1943_Nov_14_NYPhil_Bernstein.ogg" />
              </audio>
            </fig>
          </section>
            </body>
          </topic>`;

      // original jdita to compare against
      const originalJdita = await xditaToJson(inputXml);

      // process the jdita document and do the round trip
      //clean the attributes from the top node to compare
      originalJdita.attributes = {};
      // transform the jdita document
      const transformedJdita = document(originalJdita);
      // untransform the transformed jdita document
      const result = unTravel(transformedJdita);

      //compare the original jdita with the result
      expect(result).to.deep.equal(originalJdita);
    });

    // this test shows the missing elements
    it.skip('handles jdita document with image', async () => {
      const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
              <!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
              <topic id="program-bulbs-to-groups">
                <title>Test File: Media Elements in XDita</title>
                <body>
              
                <section>
                <title>An Image</title>
                <fig>
                  <image outputclass="imageElement" height="300px" width="300px" href="https://placekitten.com/300/300">
                    <alt>A kitten</alt>
                  </image>
                </fig>
              </section>
              </body>
              </topic>`;

      // original jdita to compare against
      const originalJdita = await xditaToJson(inputXml);

      // process the jdita document and do the round trip
      //clean the attributes from the top node to compare
      originalJdita.attributes = {};
      // transform the jdita document
      const transformedJdita = document(originalJdita);
      // untransform the transformed jdita document
      const result = unTravel(transformedJdita);

      //compare the original jdita with the result
      expect(result).to.deep.equal(originalJdita);
    });

  });

});

describe('Const NODES handles', () => {
  let parent: JDita, value: JDita, result: any, expected: any;

  describe('function video()', () => {
    it('returns a video node', () => {
      value = JSON.parse('{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]}');
      parent = JSON.parse('{"nodeName":"body","attributes":{},"children":[{"nodeName":"p","attributes":{"parent":"body"},"children":[{"nodeName":"text","content":"Paragraph"}]},{"nodeName":"audio","attributes":{}},{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]},{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}]}');
      expected = JSON.parse('{"type":"video","attrs":{"width":"640","height":"360"},"content":[{"type":"desc","attrs":{"parent":"video"},"content":[{"type":"text","text":"Your browser does not support the video tag.","attrs":{"parent":"desc"}}]}]}');
      result = NODES.video(value, parent);
      assert.deepEqual(result, expected);
    });
  });

  describe('function audio()', () => {
    it('returns an audio node', () => {
      value = JSON.parse('{"nodeName":"audio","attributes":{}}');
      parent = JSON.parse('{"nodeName":"body","attributes":{},"children":[{"nodeName":"p","attributes":{"parent":"body"},"children":[{"nodeName":"text","content":"Paragraph"}]},{"nodeName":"audio","attributes":{}},{"nodeName":"video","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"desc","attributes":{},"children":[{"nodeName":"text","content":"Your browser does not support the video tag."}]}]},{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}]}');
      expected = JSON.parse('{"type":"audio","attrs":{},"content":[]}');
      result = NODES.audio(value, parent);
      assert.deepEqual(result, expected);
    });
  });

  describe('function image()', () => {
    describe('for image nodes without an alt node', () => {
      it('returns a transformed image node', () => {
        value = JSON.parse('{"nodeName":"image","attributes":{}}');
        parent = JSON.parse('{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{}}]}');
        expected = JSON.parse('{"type":"image","attrs":{}}');
        result = NODES.image(value, parent);
        assert.deepEqual(result, expected);
      });
    });

    describe('for image nodes with an alt node and attributes', () => {
      it('returns a transformed image node', () => {
        value = JSON.parse('{"nodeName":"image","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"alt","attributes":{},"children":[{"nodeName":"text","content":"Alt text"}]}]}');
        parent = JSON.parse('{"nodeName":"p","attributes":{},"children":[{"nodeName":"image","attributes":{"width":"640","height":"360"},"children":[{"nodeName":"alt","attributes":{},"children":[{"nodeName":"text","content":"Alt text"}]}]}]}');
        expected = JSON.parse('{"type":"image","attrs":{"width":"640","height":"360","alt":"Alt text"}}');
        result = NODES.image(value, parent);
        assert.deepEqual(result, expected);
      });
    });
  });
});