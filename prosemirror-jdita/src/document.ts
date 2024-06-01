import { IS_MARK, defaultNodeName } from "./schema";

/**
 * Removes undefined attributes from an object
 *
 * @param object  - Generic object
 * @returns object - The object with undefined attributes removed
 */
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
 * A map of special nodes that need to be handled differently.
 * Instead of using the defaultTravel function, we use the special node function
 * The following 4 nodes (audio, video, image, text) are
 * treated in a customized way instead of applying the defaultTravel() function:
 */
export const NODES: Record<string, (value: JDita, parent: JDita) => any> = {
  audio: (value) => {
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];
    if (value.children) {
      value.children.forEach(child => {
        if (child.nodeName === 'media-autoplay') {
          attrs.autoplay = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-controls') {
          attrs.controls = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-loop') {
          attrs.loop = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-muted') {
          attrs.muted = child.attributes?.value;
          return;
        }
        if (['desc', 'media-track', 'media-source'].indexOf(child.nodeName) > -1) {
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
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];
    if (value.children) {
      value.children.forEach(child => {
        if (child.nodeName === 'media-autoplay') {
          attrs.autoplay = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-controls') {
          attrs.controls = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-loop') {
          attrs.loop = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-muted') {
          attrs.muted = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'video-poster') {
          attrs.poster = child.attributes?.value;
          return;
        }
        if (['desc', 'media-track', 'media-source'].indexOf(child.nodeName) > -1) {
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
export function defaultTravel(value: JDita): any {
  // children will become content
  const content = value.children?.map(child => travel(child, value));
  // attributes will become attrs
  const attrs = value.attributes || {};
  // remove undefined attributes
  deleteUndefined(attrs);
  // node name will become type
  const type = defaultNodeName(value.nodeName);
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
 * @param jdita - the JDita document
 * @returns transformed JDita document
 */
export function document(jdita: JDita): Record<string, any> {
  /**
   * Example input:
  {
    "nodeName": "document",
    "children": [
      {
        "nodeName": "topic",
        "attributes": {
          "id": "intro-product"
        },
        "children": [
          {
            "nodeName": "title",
            "attributes": {},
            "children": [
              {
                "nodeName": "text",
                "content": "Overview"
              }
            ]
          }
        ]
      }
    ]
  }
  */

  /**
   * Example output of the transformation `travel(jdita, jdita)`:
  {
    "type": "doc",
    "attrs": {},
    "content": [
      {
        "type": "topic",
        "attrs": {
          "id": "intro-product",
          "parent": "doc"
        },
        "content": [
          {
            "type": "title",
            "attrs": {
              "parent": "topic"
            },
            "content": [
              {
                "type": "text",
                "text": "Overview",
                "attrs": {
                  "parent": "title"
                }
              }
            ]
          }
        ]
      }
    ]
  }
  */

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
export function unTravel(prosemirrorDocument: Record<string, any>): JDita {

  // Prosemirror content will become JDITA children
  const children = prosemirrorDocument.content?.map(unTravel);

  // attrs will become attributes
  const attributes = prosemirrorDocument.attrs || {};

  // get the node name
  const nodeName = getJditaNodeName(prosemirrorDocument.type);

  if (nodeName === 'video' || nodeName === 'audio' || nodeName === 'image' || nodeName === 'text') {
    return mediaNodeUntravel(nodeName, attributes, children, prosemirrorDocument)
  }

  // handle the attributes
  for (const key in attributes) {
    if (!attributes[key]) {
      delete attributes[key];
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
 * @param attributes - Record<string, string> node attributes
 * @param children - JDita[] node children
 * @param prosemirrorDocument - Record<string, any> prosemirror document 
 * @returns JDita node
 */
function mediaNodeUntravel(nodeName: string, attributes: Record<string, string>, children: JDita[], prosemirrorDocument: Record<string, any>): JDita {
  if (nodeName === 'video') {
    // we must populate the video node with the necessary attributes and children
    const allAttributes = { props: attributes.props, dir: attributes.dir, "xml:lang": attributes['xml:lang'], translate: attributes.translate, id: attributes.id, conref: attributes.conref, outputclass: attributes.outputclass, class: attributes.class, width: attributes.width, height: attributes.height }

    const allChildren: JDita[] = [];
    //children[0] resembles the video desc this value does not change
    allChildren.push(children[0]) // video desc node

    if (attributes.poster !== undefined) {
      const poster: JDita = createMediaChild('video-poster', attributes.poster);
      allChildren.push(poster);
    }

    if (attributes.controls !== undefined) {
      const controls: JDita = createMediaChild('media-controls', attributes.controls);
      allChildren.push(controls);
    }

    if (attributes.autoplay !== undefined) {
      const autoplay: JDita = createMediaChild('media-autoplay', attributes.autoplay);
      allChildren.push(autoplay);
    }

    if (attributes.loop !== undefined) {
      const loop: JDita = createMediaChild('media-loop', attributes.loop);
      allChildren.push(loop);
    }

    if (attributes.muted !== undefined) {
      const muted: JDita = createMediaChild('media-muted', attributes.muted);
      allChildren.push(muted);
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
    const allAudioAttributes = { class: attributes.class, conref: attributes.conref, "xml:lang": attributes['xml:lang'], dir: attributes.dir, id: attributes.id, outputclass: attributes.outputclass, props: attributes.props, translate: attributes.translate }

    const allAudioChildren: JDita[] = [];
    allAudioChildren.push(children[0])

    if (attributes.controls !== undefined) {
      const controls: JDita = createMediaChild('media-controls', attributes.controls);
      allAudioChildren.push(controls);
    }

    if (attributes.autoplay !== undefined) {
      const autoplay: JDita = createMediaChild('media-autoplay', attributes.autoplay);
      allAudioChildren.push(autoplay);
    }

    if (attributes.loop !== undefined) {
      const loop: JDita = createMediaChild('media-loop', attributes.loop);
      allAudioChildren.push(loop);
    }

    if (attributes.muted !== undefined) {
      const muted: JDita = createMediaChild('media-muted', attributes.muted);
      allAudioChildren.push(muted);
    }

    if (attributes.source !== undefined) {
      const source: JDita = createMediaChild('media-source', attributes.source);
      allAudioChildren.push(source);
    }

    allAudioChildren.push(children[1])

    return {
      nodeName,
      'attributes': allAudioAttributes,
      'children': allAudioChildren
    }
  }

  if (nodeName === 'image') {
    const allImageAttributes = { props: attributes.props, dir: attributes.dir, "xml:lang": attributes['xml:lang'], translate: attributes.translate, keyref: attributes.keyref, href: attributes.href, format: attributes.format, scope: attributes.scope, outputclass: attributes.outputclass, class: attributes.class, width: attributes.width, height: attributes.height }

    const allImageChildren: JDita[] = [];
    allImageChildren.push({
      nodeName: 'alt',
      // all of the attributes will be undefined as the alt node only contains text
      attributes: {
        dir: undefined,
        "xml:lang": undefined,
        translate: undefined,
        props: undefined,
        keyref: undefined,
        outputclass: undefined,
        class: undefined,
      },
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

  if (nodeName === 'text') {
    return {
      nodeName,
      'content': prosemirrorDocument.text
    }
  }

  throw new Error('Invalid node name');
}

/**
 * Creates children for media nodes
 * Children like media-autoplay, media-controls, media-loop, media-muted, video-poster, media-source share all the same structure
 * This is a helper function to create these children
 * 
 * @param nodeName string 
 * @param value string
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
