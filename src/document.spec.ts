import ChaiPromised from 'chai-as-promised';
import { use } from 'chai';
import { expect, assert } from 'chai';
import { xditaToJson } from 'jdita';
import { document } from './document';

use(ChaiPromised);

const pmjson = '{"type":"doc","content":[{"type":"topic","attrs":{"id":"program-bulbs-to-groups"},"content":[{"type":"title","attrs":{},"content":[{"type":"text","text":"Programming Light Bulbs to a Lighting Group"}]},{"type":"shortdesc","attrs":{},"content":[{"type":"text","text":"You can program one or more light bulbs to a lighting group to operate that group\\n    with your remote control."}]},{"type":"body","attrs":{},"content":[{"type":"video","attrs":{"width":"320","height":"240","controls":true,"poster":"bulb.jpg"},"content":[{"type":"media_source","attrs":{"value":"movie.mp4"}},{"type":"media_source","attrs":{"value":"movie.ogg"}}]},{"type":"section","attrs":{"id":"context"},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Your "},{"type":"ph","attrs":{"keyref":"product-name"}},{"type":"text","text":" remote control can manage up to 250 network light bulbs on the same lighting\\n        network. When you add a light bulb to the network, you can program it to one or more\\n        lighting groups. You must assign a light bulb to at least one lighting group to\\n        operate that light bulb  A network light bulb that is not programmed to a\\n        lighting group will still operate when controlling all network light bulbs from\\n        the remote control."}]}]},{"type":"section","attrs":{"id":"steps"},"content":[{"type":"ol","attrs":{},"content":[{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Make sure your "},{"type":"b","attrs":{},"content":[{"type":"text","text":"remote control"}]},{"type":"text","text":" is in range of the "},{"type":"i","attrs":{},"content":[{"type":"text","text":"light bulbs"}]},{"type":"text","text":" you are\\n        adding."}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"If a network "},{"type":"u","attrs":{},"content":[{"type":"text","text":"light bulb"}]},{"type":"text","text":" is new, you must install it by performing the following\\n          steps:"}]},{"type":"ol","attrs":{},"content":[{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Make sure "},{"type":"sup","attrs":{},"content":[{"type":"text","text":"power"}]},{"type":"text","text":" to the "},{"type":"sub","attrs":{},"content":[{"type":"text","text":"fixture"}]},{"type":"text","text":" where you are installing the light bulb\\n              is turned OFF.\\n"},{"type":"image","attrs":{"alt":"alt text"}},{"type":"text","text":"\\n              "},{"type":"image","attrs":{}}]},{"type":"p","attrs":{"conref":"intro-product.dita#intro-product/warning"}}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Remove any existing light bulb from the light fixture."}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Install the network light bulb into the light fixture as you would any\\n              standard light bulb."}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Turn power to the light fixture on."}]},{"type":"p","attrs":{},"content":[{"type":"text","text":"The light bulb begins to brighten and dim while finding the\\n              remote control\'s network."}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Repeat steps for each new network light bulb."}]}]}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Turn power on to the fixtures containing network light bulbs you want added to\\n          the light group."}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Turn power off to the fixtures containing light bulbs you do not want added to\\n          the light group. "}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"On the remote control, press and hold the desired lighting group button for 5\\n          seconds."}]},{"type":"p","attrs":{},"content":[{"type":"text","text":"The button indicator for the selected lighting group flashes green while\\n          the light bulb(s) are added to the group. If the indicator flashes red, the\\n          lighting group was not activated and you must try again. Light flashes red for 3\\n          seconds if programming fails."}]}]},{"type":"li","attrs":{},"content":[{"type":"p","attrs":{},"content":[{"type":"text","text":"Leave the light fixture switches ON so that power is available when using your\\n          remote control to turn the light bulbs on and off. Also remember to turn on any\\n          excluded fixtures that you turned off."}]}]}]}]}]}]}]}';
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program-bulbs-to-groups">
  <title>Programming Light Bulbs to a Lighting Group</title>
  <shortdesc>You can program one or more light bulbs to a lighting group to operate that group
    with your remote control.</shortdesc>
  <body>
    <video width="320" height="240">
      <media-controls />
      <video-poster value="bulb.jpg" />
      <media-source value="movie.mp4" />
      <media-source value="movie.ogg" />
      <desc>Your browser does not support the video tag.</desc>
    </video>
    <section id="context">
      <p>Your <ph keyref="product-name"/> remote control can manage up to 250 network light bulbs on the same lighting
        network. When you add a light bulb to the network, you can program it to one or more
        lighting groups. You must assign a light bulb to at least one lighting group to
        operate that light bulb  A network light bulb that is not programmed to a
        lighting group will still operate when controlling all network light bulbs from
        the remote control.</p>
    </section>
    <section id="steps">
    <ol>
      <li><p>Make sure your <b>remote control</b> is in range of the <i>light bulbs</i> you are
        adding.</p></li>
      <li><p>If a network <u>light bulb</u> is new, you must install it by performing the following
          steps:</p>
          <ol>
            <li><p>Make sure <sup>power</sup> to the <sub>fixture</sub> where you are installing the light bulb
              is turned OFF.
<image><alt>alt text</alt></image>
              <image></image></p>
              <p conref="intro-product.dita#intro-product/warning" />

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
          remote control to turn the light bulbs on and off. Also remember to turn on any
          excluded fixtures that you turned off.</p></li>
    </ol>
    </section>

  </body>
</topic>
`

describe('Prosemirror objects', () => {
  it('Document', async () => {
    await expect(
      xditaToJson(xml)
        .then(jdita => JSON.stringify(document(jdita)))
        .catch(e => console.log('error:', e))
    ).to.eventually.become(pmjson);
  });
});
