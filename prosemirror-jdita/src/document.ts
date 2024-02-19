import { JDita } from "jdita";
import { IS_MARK, defaultNodeName } from "./schema";

/**
 * deleteUndefined removes undefined attributes from an object
 * @param object
 * @returns object - the object with undefined attributes removed
 */
function deleteUndefined(object?: any) {
  if (object) {
    for (let key in object) {
      if (typeof object[key] === 'undefined') {
        delete(object[key]);
      }
    }
  }
  return object;
}

// the special nodes that need to be handled differently
/**
 * NODES is a map of special nodes that need to be handled differently.
 * instead of using the defaultTravel function, we use the special node function
 * The following 4 nodes (audio, video, image, text) are
 * treated in a customized way instead of applying the defaultTravel() function:
 * Apply and rename the xdita attribute strings from the AST into HTML-complying strings (?).
 */
export const NODES: Record<string, (value: JDita, parent: JDita) => any> = {
  audio: (value, parent) => {
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];
    if (value.children) {
      value.children.forEach(child => {
        if (child.nodeName === 'media-autoplay') {
          attrs.autoplay = 'autoplay';
          return;
        }
        if (child.nodeName === 'media-controls') {
          attrs.controls = 'controls';
          return;
        }
        if (child.nodeName === 'media-loop') {
          attrs.loop = 'loop';
          return;
        }
        if (child.nodeName === 'media-muted') {
          attrs.muted = 'muted';
          return;
        }
        if (['desc', 'media-track', 'media-source'].indexOf(child.nodeName) > -1) {
          content.push(child);
          return;
        }
      });
    }
    const result = { type: value.nodeName, attrs, content: content.map(child => travel(child, value)) };
    // why are we setting attrs here again. It's already set above?
    if (attrs && Object.keys(attrs).length) {
      result.attrs = attrs;
    }
    return result;
  },
  video: (value, parent) => {
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];
    if (value.children) {
      value.children.forEach(child => {
        if (child.nodeName === 'media-autoplay') {
          attrs.autoplay = 'autoplay';
          return;
        }
        if (child.nodeName === 'media-controls') {
          attrs.controls = 'controls';
          return;
        }
        if (child.nodeName === 'media-loop') {
          attrs.loop = 'loop';
          return;
        }
        if (child.nodeName === 'media-muted') {
          attrs.muted = 'muted';
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
  image: (value, parent) => {
    if (value.children
      && value.children[0].nodeName === 'alt'
      && value.children[0]?.children
      && value.children[0].children[0].nodeName == 'text'
      ) {
      const attrs = deleteUndefined({ ...value.attributes, alt: value.children[0].children[0].content });
      const result = { type: 'image', attrs };
      return result;
    }
    return defaultTravel(value, parent);
  },
  text: (value: JDita) => ({ type: 'text', text: value.content, attrs: {} }),
};

/**
 * defaultTravel transforms the JDita document into ?? TODO: why are we doing this?
 *
 * @param value - the JDita node
 * @param parent - the parent JDita node
 * @returns transformed JDita node
 */
function defaultTravel(value: JDita, parent: JDita): any {
  // children will become content
  const content = value.children?.map(child => travel(child, value));
  // attributes will become attrs
  const attrs =  value.attributes || {};
  // remove undefined attributes
  deleteUndefined(attrs);
  // node name will become type
  const type = defaultNodeName(value.nodeName);
  let result: any;
  // IS_MARK is the array  `u, s, b, sup, sub`
  if (IS_MARK.indexOf(value.nodeName) > -1) {
    // why exactly 1? content can't have more then 1 element?
    if (content?.length === 1) {
      result = content[0];
      // find out what .marks is and why are we setting?
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
 * Travel function is a recursive function that traverses the JDita document and generates a ProseMirror document
 *
 * @param value
 * @param parent
 * @returns
 */
function travel(value: JDita, parent: JDita): any {
  //if it's a special node, use the special node function, otherwise use the default travel function
  const result = (NODES[value.nodeName] || defaultTravel)(value, parent);
  // if the node is not a document and has attributes, set the parent attribute
  if (value.nodeName !== 'doc' && result.attrs) {
    result.attrs.parent = parent.nodeName;
  }
  return result;
}


// generate a prosemirror document from a jdita document
export function document(jdita: JDita): Record<string, any> {
  if (jdita.nodeName === 'document') {
    jdita.nodeName = 'doc';
    return travel(jdita, jdita);
  }
  throw new Error('jdita must be a document');
}