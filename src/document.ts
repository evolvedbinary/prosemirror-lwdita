import { JDita } from "jdita/src/classes";

export const NODES: Record<string, (value: JDita) => any> = {
  audio: (value: JDita) => {
    const attrs: any = { ...value.attributes };
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
    return { type: value.nodeName, attrs, content: content.map(travel) };
  },
  image: (value: JDita) => {
    if (value.children
      && value.children[0].nodeName === 'alt'
      && value.children[0]?.children
      && value.children[0].children[0].nodeName == 'text'
      ) {
      const attrs = { ...value.attributes, alt: value.children[0].children[0].content };
      return { type: 'image', attrs };
    }
    return defaultTravel(value);
  },
  text: (value: JDita) => ({ type: 'text', text: value.content }),
};
NODES.video = NODES.audio;

function defaultTravel(value: JDita): any {
  return {
    type: value.nodeName.replace(/-/g, '_'),
    attrs: value.attributes,
    content: value.children?.map(travel),
  };
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