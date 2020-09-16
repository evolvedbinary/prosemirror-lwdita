import { BaseNode, getNodeClassType, UnknownNodeError, DocumentNode, nodeGroups, customChildTypesToString } from 'jdita';
import { getDomNode } from './dom';
import { ChildTypes } from 'jdita';
import { NodeSpec, Schema, SchemaSpec, Node, MarkSpec } from 'prosemirror-model';


export const NODE_NAMES: Record<string, string> = {
  document: 'doc',
}
export const NODE_ATTRS: Record<string, (attrs: string[]) => any> = {
  video: node => defaultNodeAttrs([...node, 'controls', 'autoplay', 'loop', 'muted', 'poster']),
  audio: node => defaultNodeAttrs([...node, 'controls', 'autoplay', 'loop', 'muted']),
}
export const NODE_ATTR_NAMES: Record<string, Record<string, string>> = {
  video: {
    _: '*',
    autoplay: '*',
    controls: '*',
  },
  'media-source': {
    value: 'src',
  },
  xref: {
    keyref: 'href',
  },
  image: {
    _: '*',
    href: 'src',
  },
}
export const SCHEMAS: Record<string, (node: typeof BaseNode, next: (nodeName: string) => void) => SchemaNode> = {
  'text': (node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode => {
    const result: SchemaNode = {
      attrs: {
        parent: { default: '' }
      },
    };
    return result;
  },
}
export const SCHEMA_CONTENT: Record<string, (type: ChildTypes, getNodeName?: (nodeName: string) => string) => string> = {
  image: type => '',
  video: type => 'desc?|media_source*|media_track*',
  audio: type => 'desc?|media_source*|media_track*',
}
export const SCHEMA_CHILDREN: Record<string, (type: ChildTypes) => string[]> = {
  video: type => ['media-source', 'media-track', 'desc'],
  audio: type => ['media-source', 'media-track', 'desc'],
}
export const IS_MARK = ['b', 'i', 'u', 'sub', 'sup'];

export interface SchemaNode {
  inline?: boolean;
  content?: string;
  group?: string;
  domNodeName?: string;
  attrs?: Record<string, { default: string }>;
}
export interface SchemaNodes {
  [key: string]: SchemaNode;
}

function getChildren(type: ChildTypes): string[] {
  if (Array.isArray(type)) {
    return type.map(subType => getChildren(subType)).reduce((result, children) =>
    result.concat(children.filter(child => result.indexOf(child) < 0)), [] as string[]);
  }
  return (type.isGroup ? nodeGroups[type.name] : [ type.name ]);
}

export function travel(node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode {
  return (SCHEMAS[node.nodeName] || defaultTravel)(node, next);
}

export function getDomAttr(nodeName: string, attr: string): string {
  return NODE_ATTR_NAMES[nodeName]
    ? NODE_ATTR_NAMES[nodeName]._
      ? NODE_ATTR_NAMES[nodeName][attr]
        ? NODE_ATTR_NAMES[nodeName][attr] === '*' ? 'data-j-' + attr : NODE_ATTR_NAMES[nodeName][attr]
        : attr
      : NODE_ATTR_NAMES[nodeName][attr] ? NODE_ATTR_NAMES[nodeName][attr] : 'data-j-' + attr
    : 'data-j-' + attr;
}

export function defaultNodeAttrs(attrs: string[]): any {
  return attrs.reduce((result, field) => {
    result[field] = { default: '' };
    return result;
  }, {} as Record<string, { default: string }>);
}

function defaultTravel(node: typeof BaseNode, parent: typeof BaseNode, next: (nodeName: string, parent: typeof BaseNode) => void): NodeSpec {
  const children = (SCHEMA_CHILDREN[node.nodeName] || getChildren)(node.childTypes);
  const content = (SCHEMA_CONTENT[node.nodeName] || customChildTypesToString)(node.childTypes, n => IS_MARK.indexOf(n) < 0
  ? NODE_NAMES[n] || n.replace(/-/g, '_')
  : 'text');
  const attrs = (NODE_ATTRS[node.nodeName] || defaultNodeAttrs)(['parent', ...node.fields]);
  const result: NodeSpec = {
    attrs,
    parseDom: [{
      tag: '[data-j-type=' + node.nodeName + ']',
      getAttrs(dom: HTMLElement) {
        return attrs
          ? Object.keys(attrs).reduce((newAttrs, attr) => {
            const domAttr = getDomAttr(node.nodeName, attr);
            if (dom.hasAttribute(domAttr)) {
              newAttrs[attr] = dom.getAttribute(domAttr);
            }
            return newAttrs;
          }, {} as any)
          : {}
      },
    }],
    toDOM(pmNode: Node) {
      return [getDomNode(node.nodeName, pmNode.attrs?.parent), attrs
        ? Object.keys(attrs).reduce((newAttrs, attr) => {
          if (pmNode.attrs[attr]) {
            const domAttr = getDomAttr(node.nodeName, attr);
            newAttrs[domAttr] = pmNode.attrs[attr];
          }
          return newAttrs;
        }, { 'data-j-type': node.nodeName } as any)
      : {}, 0];
    }
  };
  if (content.length) {
    result.content = content;
  }
  if (node.inline) {
    result.inline = true;
  }
  result.inline = true;
  children.forEach(child => next(child, node));
  return result;
}

export function defaultNodeName(nodeName: string): string {
  return NODE_NAMES[nodeName] || nodeName.replace(/-/g, '_');
}

export function schema(): Schema {
  const done: string[] = [];
  const spec: SchemaSpec = {
    nodes: {
      text: {},
      'text_node': {
        domNodeName: 'span',
        content: 'text*',
      },
    },
    marks: {},
  }
  function browse(node: string | typeof BaseNode, parent: typeof BaseNode): void {
    const nodeName = typeof node === 'string' ? node : node.nodeName;
    if (done.indexOf(nodeName) > -1) {
      return;
    }
    done.push(nodeName);
    if (['alt', 'text'].indexOf(node as string) > -1) {
      return;
    }
    try {
      const NodeClass = typeof node === 'string' ? getNodeClassType(node) : node;
      const result = defaultTravel(NodeClass, parent, browse);
      if (result) {
        if (IS_MARK.indexOf(nodeName) > -1) {
          (spec.marks as Record<string, MarkSpec>)[defaultNodeName(nodeName)] = result as MarkSpec;
        } else {
          (spec.nodes as Record<string, NodeSpec>)[defaultNodeName(nodeName)] = result;
        }
      }
    } catch (e) {
      if (e instanceof UnknownNodeError) {
      } else {
        console.error(node);
        console.error(e);
      }
    }
  }
  browse(DocumentNode, DocumentNode);
  console.log('nodes:', spec.nodes);
  console.log('marks:', spec.marks);
  return new Schema(spec);
}