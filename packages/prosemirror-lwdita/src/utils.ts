/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * Convert a node name from the LwDITA schema to a node name in the ProseMirror schema.
 * 
 * @param name - The node name from the LwDITA schema.
 * @param parentAllowsMixedContent - Whether the parent node allows mixed content.
 * @returns The node name in the ProseMirror schema.
 */
export function lwditaNodeNameToSchemaNodeName(name: string, parentAllowsMixedContent: boolean) {
  if(!parentAllowsMixedContent && name !== "doc") {
    return "block_" + name;
  }
  return name;
}

/**
 * Convert a node name from the ProseMirror schema to a node name in the LwDITA schema.
 * 
 * @param name - The node name from the ProseMirror schema.
 * @returns The node name in the LwDITA schema.
 */
export function schemaNodeNameToLwditaNodeName(name: string) {
  return name.replace("block_", "");
}