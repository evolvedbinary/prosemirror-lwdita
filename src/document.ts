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

export const NODES: Record<string, (value: JDita) => any> = {
  audio: (value: JDita) => {
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];
    if (value.children) {
      value.children.forEach(child => {
        if (child.nodeName === 'media-autoplay') {
          attrs.autoplay = true;
          return;
        }
        if (child.nodeName === 'media-controls') {
          attrs.controls = true;
          return;
        }
        if (child.nodeName === 'media-loop') {
          attrs.loop = true;
          return;
        }
        if (child.nodeName === 'media-muted') {
          attrs.muted = true;
          return;
        }
        if (child.nodeName === 'media-track' || child.nodeName === 'media-source') {
          content.push(child);
          return;
        }
      });
    }
    const result = { type: value.nodeName, attrs, content: content.map(travel) };
    if (attrs && Object.keys(attrs).length) {
      result.attrs = attrs;
    }
    return result;
  },
  video: (value: JDita) => {
    const attrs: any = deleteUndefined({ ...value.attributes });
    const content: JDita[] = [];
    if (value.children) {
      value.children.forEach(child => {
        if (child.nodeName === 'media-autoplay') {
          attrs.autoplay = true;
          return;
        }
        if (child.nodeName === 'media-controls') {
          attrs.controls = true;
          return;
        }
        if (child.nodeName === 'media-loop') {
          attrs.loop = true;
          return;
        }
        if (child.nodeName === 'media-muted') {
          attrs.muted = true;
          return;
        }
        if (child.nodeName === 'video-poster') {
          attrs.poster = child.attributes?.value;
          return;
        }
        if (child.nodeName === 'media-track' || child.nodeName === 'media-source') {
          content.push(child);
          return;
        }
      });
    }
    const result = { type: value.nodeName, attrs, content: content.map(travel) };
    if (attrs && Object.keys(attrs).length) {
      result.attrs = attrs;
    }
    return result;
  },
  image: (value: JDita) => {
    if (value.children
      && value.children[0].nodeName === 'alt'
      && value.children[0]?.children
      && value.children[0].children[0].nodeName == 'text'
      ) {
      const attrs = deleteUndefined({ ...value.attributes, alt: value.children[0].children[0].content });
      const result = { type: 'image', attrs };
      if (attrs && Object.keys(attrs).length) {
        result.attrs = attrs;
      }
      return result;
    }
    return defaultTravel(value);
  },
  text: (value: JDita) => ({ type: 'text', text: value.content }),
};

function defaultTravel(value: JDita): any {
  const content = value.children?.map(travel);
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
    };
    if (content) {
      result.content = content;
    }
    if (attrs && Object.keys(attrs).length) {
      result.attrs = attrs;
    }
  }
  return result;
}
export function travel(value: JDita): any {
  return (NODES[value.nodeName] || defaultTravel)(value);
}


export function document(jdita: JDita) {
  if (jdita.nodeName === 'document') {
    jdita.nodeName = 'doc';
    return travel(jdita);
  }
  throw new Error('jdita must be a document');
}