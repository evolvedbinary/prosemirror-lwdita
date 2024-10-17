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

import { loadConfig, fetchConfig, AppConfig } from './index';

let config: AppConfig | null = null;

/**
 * Get the application configuration
 *
 * @returns The application configuration
 */
export async function getConfig(): Promise<AppConfig> {
  if (config) {
    return config;
  }

  try {
    const customConfig = await fetchConfig('/api/config');
    config = loadConfig(customConfig);
  } catch (error) {
    console.error('Failed to fetch custom config:', error);
    // Use default config if fetching fails
    config = loadConfig();
  }

  return config;
}