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

/**
 * test-utils.ts
 *
 * Provides objects and strings to mock test data
 */

export function node(name: string, attrs: Record<string, string> = {}, content: string = ''): string {
  return `<${name} ${Object.keys(attrs).map(attr => attr + '="' + attrs[attr] + '"').join(' ')}>${content}</${name}>`;
}

export function topic(attrs: Record<string, string> = {}, content: string = ''): string {
  return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">` + node('topic', attrs, content);
}

export function title(attrs: Record<string, string> = {}, content: string = ''): string {
  return topic({}, node('title', attrs, content))
}

export const JDITA_NODE               = '{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]}';
export const JDITA_PARENT_NODE        = '{"nodeName":"topic","attributes":{"id":"program"},"children":[{"nodeName":"title","attributes":{},"children":[{"nodeName":"text","content":"Programming Light Bulbs to a Lighting Group"}]},{"nodeName":"body","attributes":{},"children":[{"nodeName":"section","attributes":{},"children":[{"nodeName":"p","attributes":{},"children":[{"nodeName":"text","content":"You must assign a light bulb to at least one lighting group to operate that light bulb."}]}]}]}]}';
export const JDITA_TRANFORMED_RESULT1 = '{"type":"title","attrs":{}}';
export const JDITA_TRANFORMED_RESULT2 = '{"type":"title","attrs":{},"content":[{"type":"text","text":"Programming Light Bulbs to a Lighting Group","attrs":{"parent":"title"}}]}';
export const XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program-bulbs-to-groups">
  <title>Programming Light Bulbs to a Lighting Group</title>
  <shortdesc>You can program one or more light bulbs to a lighting group to operate that group
    with your remote control.</shortdesc>
  <body>
    <video width="320" height="240">
      <video-poster value="bulb.jpg" />
      <media-controls value="true"/>
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
export const PMJSON = '{"type":"doc","attrs":{},"content":[{"type":"topic","attrs":{"parent":"doc","id":"program-bulbs-to-groups"},"content":[{"type":"title","attrs":{"parent":"topic"},"content":[{"type":"text","attrs":{"parent":"title"},"text":"Programming Light Bulbs to a Lighting Group"}]},{"type":"shortdesc","attrs":{"parent":"topic"},"content":[{"attrs":{"parent":"shortdesc"},"type":"text","text":"You can program one or more light bulbs to a lighting group to operate that group\\n    with your remote control."}]},{"type":"body","attrs":{"parent":"topic"},"content":[{"type":"video","attrs":{"width":"320","height":"240","controls":"controls","parent":"body","poster":"bulb.jpg"},"content":[{"type":"media_source","attrs":{"parent":"video","value":"movie.mp4"}},{"type":"media_source","attrs":{"parent":"video","value":"movie.ogg"}}]},{"type":"section","attrs":{"parent":"body","id":"context"},"content":[{"type":"p","attrs":{"parent":"section"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"Your "},{"type":"ph","attrs":{"parent":"p","keyref":"product-name"}},{"type":"text","attrs":{"parent":"p"},"text":" remote control can manage up to 250 network light bulbs on the same lighting\\n        network. When you add a light bulb to the network, you can program it to one or more\\n        lighting groups. You must assign a light bulb to at least one lighting group to\\n        operate that light bulb  A network light bulb that is not programmed to a\\n        lighting group will still operate when controlling all network light bulbs from\\n        the remote control."}]}]},{"type":"section","attrs":{"parent":"body","id":"steps"},"content":[{"type":"ol","attrs":{"parent":"section"},"content":[{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"Make sure your "},{"attrs":{"parent":"p"},"type":"text","text":"remote control","marks":[{"type":"b"}]},{"type":"text","attrs":{"parent":"p"},"text":" is in range of the "},{"type":"text","text":"light bulbs","attrs":{"parent":"p"},"marks":[{"type":"i"}]},{"type":"text","attrs":{"parent":"p"},"text":" you are\\n        adding."}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"If a network "},{"type":"text","attrs":{"parent":"p"},"text":"light bulb","marks":[{"type":"u"}]},{"type":"text","attrs":{"parent":"p"},"text":" is new, you must install it by performing the following\\n          steps:"}]},{"type":"ol","attrs":{"parent":"li"},"content":[{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"Make sure "},{"type":"text","text":"power","attrs":{"parent":"p"},"marks":[{"type":"sup"}]},{"type":"text","attrs":{"parent":"p"},"text":" to the "},{"type":"text","text":"fixture","attrs":{"parent":"p"},"marks":[{"type":"sub"}]},{"type":"text","attrs":{"parent":"p"},"text":" where you are installing the light bulb\\n              is turned OFF.\\n"},{"type":"image","attrs":{"parent":"p","alt":"alt text"}},{"type":"text","attrs":{"parent":"p"},"text":"\\n              "},{"attrs":{"parent":"p"},"type":"image"}]},{"type":"p","attrs":{"parent":"li","conref":"intro-product.dita#intro-product/warning"}}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"Remove any existing light bulb from the light fixture."}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"Install the network light bulb into the light fixture as you would any\\n              standard light bulb."}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"Turn power to the light fixture on."}]},{"type":"p","attrs":{"parent":"li"},"content":[{"type":"text","attrs":{"parent":"p"},"text":"The light bulb begins to brighten and dim while finding the\\n              remote control\'s network."}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"Repeat steps for each new network light bulb."}]}]}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"Turn power on to the fixtures containing network light bulbs you want added to\\n          the light group."}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"Turn power off to the fixtures containing light bulbs you do not want added to\\n          the light group. "}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"On the remote control, press and hold the desired lighting group button for 5\\n          seconds."}]},{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"The button indicator for the selected lighting group flashes green while\\n          the light bulb(s) are added to the group. If the indicator flashes red, the\\n          lighting group was not activated and you must try again. Light flashes red for 3\\n          seconds if programming fails."}]}]},{"type":"li","attrs":{"parent":"ol"},"content":[{"type":"p","attrs":{"parent":"li"},"content":[{"attrs":{"parent":"p"},"type":"text","text":"Leave the light fixture switches ON so that power is available when using your\\n          remote control to turn the light bulbs on and off. Also remember to turn on any\\n          excluded fixtures that you turned off."}]}]}]}]}]}]}]}';

export const JDITA_OBJECT = '{ "nodeName": "document", "children": [ { "nodeName": "topic", "attributes": { "id": "program" }, "children": [ { "nodeName": "title", "attributes": {}, "children": [ { "nodeName": "text", "content": "Programming Light Bulbs to a Lighting Group" } ] }, { "nodeName": "shortdesc", "attributes": {}, "children": [ { "nodeName": "text", "content": "You can program one or more light bulbs." } ] }, { "nodeName": "body", "attributes": {}, "children": [ { "nodeName": "section", "attributes": {}, "children": [ { "nodeName": "p", "attributes": {}, "children": [ { "nodeName": "text", "content": "You must assign a light bulb to at least one lighting group to operate that light bulb." } ] } ] } ] } ] } ] }';

export const TRANSFORMED_JDITA_OBJECT = '{ "type": "doc", "attrs": {}, "content": [ { "type": "topic", "attrs": { "id": "program", "parent": "doc" }, "content": [ { "type": "title", "attrs": { "parent": "topic" }, "content": [ { "type": "text", "text": "Programming Light Bulbs to a Lighting Group", "attrs": { "parent": "title" } } ] }, { "type": "shortdesc", "attrs": { "parent": "topic" }, "content": [ { "type": "text", "text": "You can program one or more light bulbs.", "attrs": { "parent": "shortdesc" } } ] }, { "type": "body", "attrs": { "parent": "topic" }, "content": [ { "type": "section", "attrs": { "parent": "body" }, "content": [ { "type": "p", "attrs": { "parent": "section" }, "content": [ { "type": "text", "text": "You must assign a light bulb to at least one lighting group to operate that light bulb.", "attrs": { "parent": "p" } } ] } ] } ] } ] } ] }';

export const shortXdita = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program">
  <title>Test File 2</title>
  <body>
    <section>
      <p>A test paragraph.</p>
    </section>
  </body>
</topic>`;

export const complexXdita = `<?xml version="1.0" encoding="UTF-8"?>
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

export const videoXdita = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program-bulbs-to-groups">
  <title>Test File: Media Elements in XDita</title>
  <body>
    <section id="demo">
      <title>
        Video Element
      </title>
      <fig>
        <video xml:lang="en" outputclass="videoElement" width="640" height="360">
          <desc outputclass="videoElementDescriptor">Xiaomi Yeelight YLDP06YL Smart Light Bulb White</desc>
          <video-poster value="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm/120px--1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm.jpg" />
          <media-controls value="true"/>
          <media-autoplay value="false"/>
          <media-loop value="false"/>
          <media-muted value="false"/>
          <media-source value="https://commons.wikimedia.org/wiki/File:1954_Kool-Aid_Commercial._Debut_of_Pitcher_Man.webm" />
        </video>
        </fig>
    </section>
  </body>
</topic>`;

export const audioXdita = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program-bulbs-to-groups">
  <title>Test File: Media Elements in XDita</title>
  <body>
    <section>
      <title>Audio Element</title>
      <fig>
        <audio xml:lang="en" outputclass="audioElement">
          <desc outputclass="audioElementDescriptor">An Audio Track</desc>
          <media-controls value="true"/>
          <media-autoplay value="false"/>
          <media-loop value="false"/>
          <media-muted value="false"/>
          <media-source value="https://commons.wikimedia.org/wiki/File:1943_Nov_14_NYPhil_Bernstein.ogg" />
        </audio>
      </fig>
    </section>
  </body>
</topic>`;

export const bXdita = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program">
  <title>Test File 2</title>
  <body>
    <section>
      <p>A test <b id="one">paragraph</b>.</p>
    </section>
  </body>
</topic>`;

export const imageXdita = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN" "lw-topic.dtd">
<topic id="program-bulbs-to-groups">
  <title>Test File: Media Elements in XDita</title>
  <body>
    <section>
      <title>An Image</title>
      <fig>
        <image xml:lang="en" format="test" dir="ltr" outputclass="imageElement" height="300px" width="300px" href="https://placekitten.com/300/300">
          <alt>A kitten</alt>
        </image>
      </fig>
    </section>
  </body>
</topic>`;