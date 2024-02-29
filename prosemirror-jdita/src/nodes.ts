/**
 * TODO: Documentation
 * // not used anywhere in the application currently
 */
export const NODES: Record<string, string> = {
  document: 'doc',
};

/**
 * TODO: Documentation
 * // not used anywhere in the application currently
 *
 * @param nodeName - TODO
 * @returns TODO
 */
export function nodeTravel(nodeName: string): string {
  return NODES[nodeName] || nodeName;
}