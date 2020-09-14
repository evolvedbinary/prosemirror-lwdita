// import { Schema } from 'prosemirror-model';
import { BaseNode, getNodeClassType, UnknownNodeError, DocumentNode, ChildType, childTypesToString, nodeGroups } from 'jdita';
import { getDomNode } from './dom';
import { ChildTypes } from 'jdita';


export const SCHEMAS: Record<string, (node: typeof BaseNode, next: (nodeName: string) => void) => SchemaNode> = {
  'text': (node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode => {
    const result: SchemaNode = {
      domNodeName: 'span',
      attrs: {},
    };
    return result;
  }
}
export const SCHEMA_CONTENT: Record<string, (type: ChildTypes) => string> = {
  image: type => '',
}
export const SCHEMA_CHILDREN: Record<string, (type: ChildTypes) => string[]> = {}

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
  return type.isGroup ? nodeGroups[type.name] : [ type.name ];
}

export function travel(node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode {
  return (SCHEMAS[node.nodeName] || defaultTravel)(node, next);
}

function defaultTravel(node: typeof BaseNode, next: (nodeName: string) => void): SchemaNode {
  const children = (SCHEMA_CHILDREN[node.nodeName] || getChildren)(node.childTypes);
  const content = (SCHEMA_CONTENT[node.nodeName] || childTypesToString)(node.childTypes);
  const result: SchemaNode = {
    domNodeName: getDomNode(node.nodeName),
    attrs: node.fields.reduce((attrs, field) => {
      attrs[field] = { default: '' };
      return attrs;
    }, {} as Record<string, { default: string }>),
  };
  if (content.length) {
    result.content = content;
  }
  if (node.inline) {
    result.inline = true;
  }
  console.log('-------------------------------------');
  console.log('children:', content);
  console.log('children:', children);
  children.forEach(next);
  return result;
}

export function schema(): any {
  const done: string[] = [];
  const schema: SchemaNodes = {
    text: {},
    'text_node': {
      domNodeName: 'span',
      content: 'text*',
    },
  };
  function browse(node: string | typeof BaseNode): void {
    const nodeName = typeof node === 'string' ? node : node.nodeName;
    // console.log('-------------------------------------');
    // console.log('found node:', nodeName);
    if (done.indexOf(nodeName) > -1) {
      return;
    }
    done.push(nodeName);
    if (['document', 'alt', 'text'].indexOf(node as string) > -1) {
      return;
    }
    try {
      const NodeClass = typeof node === 'string' ? getNodeClassType(node) : node;
      const resultNodename = nodeName.replace(/-/g, '_');
      // console.log('  traveling:', nodeName);
      const result = defaultTravel(NodeClass, browse);
      // console.log('  got:', result);
      if (result) {
        schema[resultNodename] = result;
      }
    } catch (e) {
      if (e instanceof UnknownNodeError) {
        // console.log(`  unknown: ${node}.`);
      } else {
        // console.log('  unknown error.');
        console.error(node);
        console.error(e);
      }
    }
  }

  browse(DocumentNode);
  console.log(JSON.stringify(schema));
  return schema;
}