export const NODES = {
  document: 'doc',
};

export function nodeTravel(nodeName: string): string {
  return NODES[nodeName] || nodeName;
}