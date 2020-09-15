import { BaseNode, getNodeClassType, UnknownNodeError, DocumentNode, nodeGroups, customChildTypesToString } from 'jdita';
import { getDomNode } from './dom';
import { ChildTypes } from 'jdita';
import { NodeSpec, Schema, SchemaSpec, Node, MarkSpec } from 'prosemirror-model';


export const NODE_NAMES: Record<string, string> = {
  document: 'doc',
}
export const SCHEMAS: Record<string, (node: typeof BaseNode, next: (nodeName: string) => void) => SchemaNode> = {
  'text': (node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode => {
    const result: SchemaNode = {
      domNodeName: 'span',
      attrs: {},
    };
    return result;
  }
}
export const SCHEMA_CONTENT: Record<string, (type: ChildTypes, getNodeName?: (nodeName: string) => string) => string> = {
  image: type => '',
}
export const SCHEMA_CHILDREN: Record<string, (type: ChildTypes) => string[]> = {}
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

function defaultTravel(node: typeof BaseNode, next: (nodeName: string) => void): NodeSpec {
  const children = (SCHEMA_CHILDREN[node.nodeName] || getChildren)(node.childTypes);
  const content = (SCHEMA_CONTENT[node.nodeName] || customChildTypesToString)(node.childTypes, n => IS_MARK.indexOf(n) < 0
  ? NODE_NAMES[n] || n.replace(/-/g, '_')
  : 'text');
  const domNodeName = getDomNode(node.nodeName);
  const attrs= node.fields.reduce((attrs, field) => {
    attrs[field] = { default: '' };
    return attrs;
  }, {} as Record<string, { default: string }>);
  const result: NodeSpec = {
    domNodeName,
    attrs,
    parseDom: [{
      tag: domNodeName + '[data-type=' + node.nodeName + ']',
      getAttrs(dom: HTMLElement) {
        return attrs
          ? Object.keys(attrs).reduce((newAttrs, attr) => {
            if (dom.hasAttribute('data-jdita-' + attr)) {
              newAttrs[attr] = dom.getAttribute('data-jdita-' + attr);
            }
            return newAttrs;
          }, {} as any)
          : {}
      },
    }],
    toDOM(pmNode: Node) {
      return [domNodeName, attrs
        ? Object.keys(attrs).reduce((newAttrs, attr) => {
          if (pmNode.attrs[attr]) {
            newAttrs['data-jdita-' + attr] = pmNode.attrs[attr];
          }
          return newAttrs;
        }, { 'data-type': node.nodeName } as any)
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
  children.forEach(next);
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
  function browse(node: string | typeof BaseNode): void {
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
      const result = defaultTravel(NodeClass, browse);
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
  browse(DocumentNode);
  console.log('nodes:', spec.nodes);
  console.log('marks:', spec.marks);
  return new Schema(spec);
}