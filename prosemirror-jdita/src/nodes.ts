/**
 * TODO: To be removed, it's not used anywhere in the application currently
 */
export const NODES: Record<string, string> = {
  document: 'doc',
};

/**
 * TODO: To be removed, it's not used anywhere in the application currently
 */
export function nodeTravel(nodeName: string): string {
  return NODES[nodeName] || nodeName;
}