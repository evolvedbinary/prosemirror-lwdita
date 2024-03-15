export const NODES: Record<string, string> = {
  document: 'doc',
};


export function nodeTravel(nodeName: string): string {
  return NODES[nodeName] || nodeName;
}