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
  video: (value) => {
    // Create a new object with title and poster attributes, if they exist:
    // the desc and the video-poster children will be assigned as new attributes to the video element
    // undefined attributes will be removed
    const attrs = deleteUndefined({
    ...value.attributes,
    title: value.children?.find(child => child.nodeName === 'desc')?.children?.[0]?.content,
    poster: value.children?.find(child => child.nodeName === 'video-poster')?.attributes?.href,
    });

    // Create a new array with the fallback, media-source and media-track children
    // that will be assigned as the content of the video element
    const content: JDita[] = [];
    value.children?.forEach(child => {
      if (['fallback', 'media-source', 'media-track'].includes(child.nodeName)) {
        content.push(child);
      }
    });

    // Return the video object with the new attributes and content
    return { type: value.nodeName, attrs, content: content?.map(child => travel(child, value)) };
  },
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
  if (value.nodeName !== 'doc' && result && result.attrs) {
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

//Escape hatch for Unit Testing due to a lack of “package-private” accessibility scope in TypeScript
export const _test_private_document = {
  deleteUndefined,
  defaultTravel,
  travel,
};
