import { JDita } from "jdita";
import { IS_MARK, defaultNodeName } from "./schema";

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

function defaultTravel(value: JDita, parent: JDita): any {
  const content = value.children?.map(child => travel(child, value));
  const attrs =  value.attributes;
  deleteUndefined(attrs);
  const type = defaultNodeName(value.nodeName);
  let result: any;;
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
export function travel(value: JDita, parent: JDita): any {
  const result = (NODES[value.nodeName] || defaultTravel)(value, parent);
  if (result.attrs) {
    result.attrs.parent = parent.nodeName;
  }
  return result;
}


export function document(jdita: JDita) {
  if (jdita.nodeName === 'document') {
    jdita.nodeName = 'doc';
    return travel(jdita, jdita);
  }
  throw new Error('jdita must be a document');
}