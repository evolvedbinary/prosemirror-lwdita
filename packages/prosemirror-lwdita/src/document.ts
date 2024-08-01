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
import { IS_MARK, defaultNodeName } from "./schema";

/**
 * Removes undefined attributes from an object
 *
 * @param object  - Generic object
 * @returns object - The object with undefined attributes removed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteUndefined(object?: any) {
  if (object) {
    for (const key in object) {
      if (typeof object[key] === 'undefined') {
        delete (object[key]);
      }
    }
  }
  return object;
}

/**
 * A map of JDita nodes that require a customized transformation into ProseMirror nodes,
 * e.g. because their content model can't be applied directly as valid HTML:
 * `audio`, `video`, `image`, `text`.
 *
 * Instead of using the defaultTravel function, we use the special node function
 * The following 4 nodes (audio, video, image, text) are
 * treated in a customized way instead of applying the defaultTravel() function:
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NODES: Record<string, (value: JDita, parent: JDita) => any> = {

  audio: (value) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];

    // If the audio node has child elements...
    if (value.children) {
      // ...loop through the child elements and ...
      value.children.forEach(child => {

        if (child.nodeName === 'desc') {
          // ... assign the desc child as a new attribute to the video element
          if (child.children) {
            const titleText = child.children[0].content;
            attrs.title = titleText;
          }
          return;
        }

        // ... keep these child elements as the content of the audio element
        if (['fallback', 'media-source', 'media-track'].indexOf(child.nodeName) > -1) {
          content.push(child);
          return;
        }
      });
    }
    const result = { type: value.nodeName, attrs, content: content.map(child => travel(child, value)) };

    if (attrs && Object.keys(attrs).length) {
      result.attrs = attrs;
    }
    return result;
  },
  video: (value) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];

    // If the video node has child elements...
    if (value.children) {
      // ...loop through the child elements and ...
      value.children.forEach(child => {

        if (child.nodeName === 'desc') {
          // ... assign the desc child as a new attribute to the video element
          if (child.children) {
            const titleText = child.children[0].content;
            attrs.title = titleText;
          }
          return;
        }

        if (child.nodeName === 'video-poster') {
          // ... assign the video-poster child as a new poster attribute to the video element
          attrs.poster = child.attributes?.href;
          return;
        }

        // ... keep these child elements as the content of the video element
        if (['fallback', 'media-source', 'media-track'].indexOf(child.nodeName) > -1) {
          content.push(child);
          return;
        }
      });
    }
    const result = { type: value.nodeName, attrs, content: content.map(child => travel(child, value)) };
    return result;
  },
  image: (value) => {
    if (value.children
      && value.children[0].nodeName === 'alt'
      && value.children[0]?.children
      && value.children[0].children[0].nodeName == 'text'
    ) {
      const attrs = deleteUndefined({ ...value.attributes, alt: value.children[0].children[0].content });
      const result = { type: 'image', attrs };
      return result;
    }
    return defaultTravel(value);
  },
  text: (value: JDita) => ({ type: 'text', text: value.content, attrs: {} }),
};

/**
 * Transforms the JDita document into a proper ProseMirror document
 *
 * @param value - The JDita node
 * @returns The transformed JDita node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defaultTravel(value: JDita): any {
  // children will become content
  const content = value.children?.map(child => travel(child, value));
  // attributes will become attrs
  const attrs = value.attributes || {};
  // remove undefined attributes
  deleteUndefined(attrs);
  // node name will become type
  const type = defaultNodeName(value.nodeName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  // IS_MARK is the array  `u, s, b, sup, sub`
  if (IS_MARK.indexOf(value.nodeName) > -1) {
    if (content?.length === 1) {
      result = content[0];
      result.marks = [{ type }]
    }
  } else {
    result = {
      type,
      attrs,
    };

    if (content) {
      result.content = content;
    }
  }
  return result;
}

/**
 * Traverses the JDita document and generates a ProseMirror document
 *
 * @param value - The JDita node
 * @param parent - The parent JDita node
 * @returns The transformed JDita node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function travel(value: JDita, parent: JDita): any {
  // if it's a special node, use the special node function,
  // otherwise use the default travel function
  const result = (NODES[value.nodeName] || defaultTravel)(value, parent);
  // if the node is not a document and has attributes, set the parent attribute
  if (value.nodeName !== 'doc' && result.attrs) {
    result.attrs.parent = parent.nodeName;
  }
  return result;
}

/**
 * Transforms the JDita document
 * into a Schema compliant JDita document
 *
 * @example
 * Here's an example input:
 * ```
 * {
 *   "nodeName": "document",
 *   "children": [
 *     {
 *       "nodeName": "topic",
 *       "attributes": {
 *       "id": "intro-product"
 *     },
 *     {
 *       "nodeName": "title",
 *       "attributes": {},
 *       "children": [
 *         {
 *           "nodeName": "text",
 *           "content": "Overview"
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 * @example
 * Here's an example output of the transformation `travel(jdita, jdita)`:
 * ```
 * {
 *   "type": "doc",
 *   "attrs": {},
 *   "content": [
 *     {
 *       "type": "topic",
 *       "attrs": {
 *         "id": "intro-product",
 *         "parent": "doc"
 *       },
 *       "content": [
 *         {
 *           "type": "title",
 *           "attrs": {
 *             "parent": "topic"
 *           },
 *           "content": [
 *             {
 *               "type": "text",
 *               "text": "Overview",
 *               "attrs": {
 *                 "parent": "title"
 *               }
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 * @param jdita - the JDita document
 * @returns transformed JDita document
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function document(jdita: JDita): Record<string, any> {
  if (jdita.nodeName === 'document') {
    jdita.nodeName = 'doc';
    /*
    Parameter `jdita` is representing the root of JDita document.
    We pass in the root node as the first parameter, and since it's the root node,
    it's also the parent node, which is passed as the second parameter.
    This will return the output of the transformation.
    */
    return travel(jdita, jdita);
  }
  throw new Error('jdita must be a document');
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
    return mediaNodeUntravel(nodeName, attributes, children)
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
        attributes: attributes,
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
function mediaNodeUntravel(nodeName: string, attributes: Record<string, string>, children: JDita[]): JDita {
  if (nodeName === 'video') {
    // we must populate the video node with the necessary attributes and children
    const allAttributes = {
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
      tabindex: attributes.tabindex,
      autoplay: attributes.autoplay,
      controls: attributes.controls,
      loop: attributes.loop,
      muted: attributes.muted,
    }

    const allChildren: JDita[] = [];
    //children[0] resembles the video desc this value does not change
    allChildren.push(children[0]) // video desc node

    if (attributes.desc !== undefined) {
      const desc: JDita = createMediaChild('desc', attributes.desc);
      allChildren.push(desc);
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
      'attributes': allAttributes,
      'children': allChildren
    }
  }

  if (nodeName === 'audio') {
    const allAudioAttributes = {
      class: attributes.class,
      conref: attributes.conref,
      "xml:lang": attributes['xml:lang'],
      dir: attributes.dir,
      id: attributes.id,
      outputclass: attributes.outputclass,
      props: attributes.props,
      translate: attributes.translate,
      tabindex: attributes.tabindex,
      autoplay: attributes.autoplay,
      controls: attributes.controls,
      loop: attributes.loop,
      muted: attributes.muted,
      source: attributes.source,
      href: attributes.href,
      format: attributes.format,
      scope: attributes.scope
    }

    const allAudioChildren: JDita[] = [];
    allAudioChildren.push(children[0])

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
      const track: JDita = createMediaChild('media-track', attributes.track);
      allAudioChildren.push(track);
    }

    allAudioChildren.push(children[1])

    return {
      nodeName,
      'attributes': allAudioAttributes,
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
      'attributes': allImageAttributes,
      'children': allImageChildren
    }
  }
  throw new Error('Invalid node name');
}

/**
 * Creates children for media nodes
 * Children like media-autoplay, media-controls, media-loop, media-muted, video-poster, media-source share all the same structure
 * This is a helper function to create these children
 *
 * @param nodeName - string
 * @param value - string
 * @returns media child node
 */
function createMediaChild(nodeName: string,value: string): JDita {
  return {
    nodeName: nodeName,
    attributes: {
      dir: undefined,
      "xml:lang": undefined,
      translate: undefined,
      name: undefined,
      value: value,
      outputclass: undefined,
      class: undefined,
    },
    children: undefined
  };
}

//Escape hatch for Unit Testing due to a lack of “package-private” accessibility scope in TypeScript
export const _test_private_document = {
  deleteUndefined,
  defaultTravel,
  travel,
};
