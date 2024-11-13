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

const fs = require('fs');
const jwt = require('jsonwebtoken');


const GITHUB_APP_ID = 977534;  // Your GitHub App ID
const PRIVATE_KEY = fs.readFileSync('src/petal-demo.2024-11-13.private-key.pem', 'utf8');
// Create the JWT
const payload = {
  iat: Math.floor(Date.now() / 1000), // Issued at time
  exp: Math.floor(Date.now() / 1000) + (10 * 60), // JWT expiration time (max 10 minutes)
  iss: GITHUB_APP_ID, // GitHub App ID
};

export const getJWT = ():string => {
  const jwtToken = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
  return jwtToken;
};

// console.log("Generated JWT:", jwtToken);

