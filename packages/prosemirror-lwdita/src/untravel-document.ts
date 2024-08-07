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

import { JDita } from "@evolvedbinary/lwdita-ast";
import { deleteUndefined } from './document';
import { commonAttributes, descAttributes, fallbackAttributes, mediaTrackAttributes } from "./attributes";

/**
* Recursively traverse through all items in the Prosemirror DOM
* and create a JDITA object
*
* @param prosemirrorDocument - The Prosemirror DOM object
* @returns The JDITA object
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unTravel(prosemirrorDocument: Record<string, any>): JDita {

  // Prosemirror content will become JDITA children
  const children = prosemirrorDocument.content?.map(unTravel);

  // attrs will become attributes
  const attributes = prosemirrorDocument.attrs || {};

  // get the node name
  const nodeName = getJditaNodeName(prosemirrorDocument.type);

  if (nodeName === 'video' || nodeName === 'audio' || nodeName === 'image') {
    return createMediaJDITAObject(nodeName, attributes, children)
  }

  // handle the attributes
  delete attributes['parent'];
  for (const key in attributes) {
    if (!attributes[key]) {
      delete attributes[key];
    }
  }

  if(nodeName === 'hard-break') {
    return {
      nodeName: 'text',
      content: '\n'
    }
  }

  if (nodeName === 'text') {
    // check for marks and wrap the content in the mark node

    if (prosemirrorDocument.marks) {
      const mark = prosemirrorDocument.marks[0].type;
      return {
        nodeName: mark,
        attributes: deleteUndefined(attributes),
        children: [
          {
            nodeName: "text",
            content: prosemirrorDocument.text
          }
        ]
      }
    }
    return {
      nodeName,
      'content': prosemirrorDocument.text
    }
  }

  const nodeObject: JDita = {
    nodeName,
    attributes,
    children
  }

  return nodeObject;
}

/**
 * Replace underscores with hyphens in node names
 *
 * @param type - The string to be modified
 * @returns The sanitized node name with hyphens
 */
function getJditaNodeName(type: string): string {
  return type.replace(/_/g, '-');
}

/**
 * Special untravel function for media nodes.
 * Reverses the transformation done by the NODES[value.nodeName] in the travel function
 *
 * @param nodeName - string node name
 * @param attributes - node attributes
 * @param children - JDita[] node children
 * @param prosemirrorDocument - prosemirror document
 * @returns JDita node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMediaJDITAObject(nodeName: string, attributes: Record<string, string>, children: JDita[]): JDita {
  console.log('children', children);
  if (nodeName === 'video') {
    // we must populate the video node with the necessary attributes and children
    const allVideoAttributes = {
      props: attributes.props,
      dir: attributes.dir,
      "xml:lang": attributes['xml:lang'],
      translate: attributes.translate,
      href: attributes.href,
      format: attributes.format,
      scope: attributes.scope,
      id: attributes.id,
      conref: attributes.conref,
      outputclass: attributes.outputclass,
      class: attributes.class,
      width: attributes.width,
      height: attributes.height,
      autoplay: attributes.autoplay,
      controls: attributes.controls,
      loop: attributes.loop,
      muted: attributes.muted,
      tabindex: attributes.tabindex,
    }

    const allChildren: JDita[] = [];
    allChildren.push(children[0])

    if (attributes.title !== undefined) {
      const desc: JDita = createMediaChild('desc', attributes.title);
      allChildren.unshift(desc); // Add 'desc' at the beginning of the array to create the expected order
    }

    if (attributes.fallback !== undefined) {
      const fallback: JDita = createMediaChild('fallback', attributes.fallback);
      allChildren.push(fallback);
    }

    if (attributes.poster !== undefined) {
      const poster: JDita = createMediaChild('video-poster', attributes.poster);
      allChildren.push(poster);
    }

    if (attributes.track !== undefined) {
      const track: JDita = createMediaChild('media-track', attributes.track);
      allChildren.push(track);
    }

    if (attributes.source !== undefined) {
      const source: JDita = createMediaChild('media-source', attributes.source);
      allChildren.push(source);
    }

    allChildren.push(children[1])

    // return the created video node
    return {
      nodeName,
      'attributes': deleteUndefined(allVideoAttributes),
      'children': allChildren
    }
  }

  if (nodeName === 'audio') {
    // Note: The order of attributes determines their ordering in the object structure
    // Important for creating unit test data
    const allAudioAttributes = {
      class: attributes.class,
      conref: attributes.conref,
      "xml:lang": attributes['xml:lang'],
      dir: attributes.dir,
      id: attributes.id,
      outputclass: attributes.outputclass,
      props: attributes.props,
      translate: attributes.translate,
      autoplay: attributes.autoplay,
      controls: attributes.controls,
      loop: attributes.loop,
      muted: attributes.muted,
      source: attributes.source,
      href: attributes.href,
      format: attributes.format,
      scope: attributes.scope,
      tabindex: attributes.tabindex,
    }

    const allAudioChildren: JDita[] = [];

    if (attributes.desc !== undefined) {
      const desc: JDita = createMediaChild('desc', attributes.desc);
      allAudioChildren.push(desc);
    }

    if (attributes.fallback !== undefined) {
      const fallback: JDita = createMediaChild('fallback', attributes.fallback);
      allAudioChildren.push(fallback);
    }

    if (attributes.source !== undefined) {
      const source: JDita = createMediaChild('media-source', attributes.source);
      allAudioChildren.push(source);
    }

    if (attributes.track !== undefined) {
      console.log('attributes.track', attributes.track)
      const track: JDita = createMediaChild('media-track', attributes.track);
      allAudioChildren.push(track);
      console.log('allAudioChildren', allAudioChildren)
    }

    allAudioChildren.push(children[1])
    console.log('allAudioChildren', allAudioChildren);
    console.log('attributes', attributes);
    return {
      nodeName,
      'attributes': deleteUndefined(allAudioAttributes),
      'children': allAudioChildren
    }
  }

  if (nodeName === 'image') {
    const allImageAttributes = {
      // %localization
      dir: attributes.dir,
      "xml:lang": attributes['xml:lang'],
      translate: attributes.translate,
      // %reference-content
      href: attributes.href,
      format: attributes.format,
      scope: attributes.scope,
      // class attributes
      outputclass: attributes.outputclass,
      class: attributes.class,
      // custom attributes
      keyref: attributes.keyref,
      width: attributes.width,
      height: attributes.height,
    }

    const allImageChildren: JDita[] = [];
    allImageChildren.push({
      nodeName: 'alt',
      // all of the attributes will be undefined as the alt node only contains text
      attributes: {
        dir: undefined,
        "xml:lang": undefined,
        translate: undefined,
        keyref: undefined,
        outputclass: undefined,
        class: undefined
      },
      // FIXME: allowed children of `alt` are: 'b', 'em', 'i', 'ph', 'strong', 'sub', 'sup', 'tt', 'u'
      children: [
        {
          nodeName: 'text',
          content: attributes.alt
        }
      ]
    })
    return {
      nodeName,
      'attributes': deleteUndefined(allImageAttributes),
      'children': allImageChildren
    }
  }
  throw new Error('Invalid node name');
}

/**
 * Creates a media child node based on the provided node name, value, and additional attributes.
 *
 * @param nodeName - The name of the node to be created
 * @param value - The value associated with the node
 * @param additionalAttributes - Additional attributes for the node (optional)
 * @returns The created media child node (JDita)
 */
function createMediaChild(nodeName: string, value: string, additionalAttributes?: { [key: string]: string | undefined }): JDita {
  // create an attributes object by merging the commonAttributes object,
  // and additional attributes based on the nodeName,
  // for media-source and video-poster add a href attribute
  const attributes = {
    ...commonAttributes,
    ...(nodeName === "desc" ? descAttributes : {}),
    ...(nodeName === "fallback" ? fallbackAttributes : {}),
    ...(nodeName === "video-poster" ? { href: value } : {}),
    ...(nodeName === "media-source" ? { href: value } : {}),
    ...(nodeName === "media-track" ? mediaTrackAttributes : {}),
    ...(additionalAttributes || {})
  };

  // create a node object based on the nodeName and attributes
  // in case of desc and fallback, the value will be wrapped in a text node
  const node = {
    nodeName: nodeName,
    attributes: attributes,
    children: (() => {
      if (nodeName === "desc") {
        return [{
          nodeName: "text",
          content: `${value}`
        }];
      } else if (nodeName === "fallback") {
        return [{
          nodeName: "p",
          attributes: {},
          children: [{
            nodeName: "text",
            content: `${value}`
          }]
        }];
      } else {
        // if the 'nodeName' is neither "desc" nor "fallback", return undefined
        return undefined;
      }
    })()
  };

  // return the created child node
  return {
    nodeName: nodeName,
    attributes: attributes,
    children: node.children
  };
}