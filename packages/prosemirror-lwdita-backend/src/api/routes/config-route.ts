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

import { Request, Response } from 'express';
import fs from 'fs';

/**
 * Get the custom application configuration
 *
 * @param _req - Request
 * @param res - Response
 */
export const getCustomConfig = (_req: Request, res: Response): void => {
  const customConfigPath = './custom-config.json';

  if (fs.existsSync(customConfigPath)) {
    const customConfig = JSON.parse(fs.readFileSync(customConfigPath, 'utf8'));
    res.json(customConfig);
  } else {
    res.status(404).json({ error: 'Custom configuration not found' });
  }
};