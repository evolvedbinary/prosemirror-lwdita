/**
 * TODO: Documentation
 */
export const NODES: Record<string, string> = {
  document: 'doc',
};

/**
 * TODO: Documentation
 *
 * @param nodeName - TODO
 * @returns TODO
 */
export function nodeTravel(nodeName: string): string {
  return NODES[nodeName] || nodeName;
}