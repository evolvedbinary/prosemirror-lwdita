# prosemirror-lwdita-backend
API Module for ProseMirror-lwDITA

This is a standalone module with its own HTTP server.
The API offers integration with source control without requiring user interaction, making contributions from ProseMirror-lwDITA possible.
It allows the functionality to take changes from ProseMirror-lwDITA and create contributions (currently, only GitHub is supported).

# Setup
install dependencies
```shell
$ yarn install
```


# Usage
Build the code
```shell
$ yarn run build
```

Start the server:
```shell
$ yarn run start
```

# Deploy to production
The API should be deployed on the host for the Prosemirror Lwdita demo provided by the Evolved Binary team,
We will assume you have nginx up and running with the config for the demo, and also have pm2 installed on your system (https://pm2.keymetrics.io/docs/usage/quick-start/), the deployment steps are as follows:
### 1. Build the app
```shell
$ yarn run build
```
### 2. Place the .ENV file
Place your .env file in the root of the backend. You can refer to .env.example for guidance.

### 3. Start the backend using pm2
Make sure you are running the following commands from the root of the backend (packages/prosemirror-lwdita-backend) so that the .env file is properly picked up:
```shell
$ pm2 start dist/server.js # start the backend
$ pm2 save # make the pm2 config persistent
```
### 4. Add the API entry in the demo Nginx config
This should be added to the /etc/nginx/sites-available/petal.evolvedbinary.com config file:

```ini
    location /api {
    proxy_pass            http://petal-api;
    proxy_read_timeout    90s;
    proxy_connect_timeout 90s;
    proxy_send_timeout    90s;
    proxy_http_version    1.1;
    proxy_set_header      Host $host;
    proxy_set_header      Upgrade $http_upgrade;
    #proxy_set_header      Connection $connection_upgrade; # Uncomment if using WebSockets
    proxy_set_header      X-Real-IP $remote_addr;
    proxy_set_header      X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header      nginx-request-uri $request_uri;
  }
```
### 5. Create the petal-api upstream block
Create a new file named petal-api in /etc/nginx/sites-available/ with the following content:

```ini
upstream petal-api {
  server localhost:3000;
}
```

### 6. Link the new file `petal-api` to `/etc/nginx/sites-enabled/`
```shell
$ ln -s /etc/nginx/sites-available/petal-api /etc/nginx/sites-enabled/
```

### 7. Reload Nginx 
```shell
$ sudo systemctl reload nginx
```

### 8. Test the API
Make a request to your server `/api/github` and you should get `Github API` as a response.

# GitHub Integration API Documentation

## Endpoint

### `GET /api/github/token`

This endpoint exchanges a GitHub OAuth code for an access token.

## Request

### Query Parameters

- **`code`** (string, required):  
  The OAuth code received from GitHub during the authorization process.

### Example Request

```bash
curl --location 'localhost:3000/api/github/token?code=*****************'
```

## Response

- **200 OK**  
  The response will contain user token.

- **403 Unauthorized**  
  Returned if the provided authorization code is invalid or missing.

## Endpoint

### `GET /api/github/user`

This endpoint retrieves details about the authenticated GitHub user based on the provided authorization token.

## Request

### Headers

- **`Authorization: Bearer {token}`**  
  Requires a valid GitHub API token for authentication. Replace `{token}` with your actual GitHub token.

## Example Request

```bash
curl --location 'localhost:3000/api/github/user' \
--header 'Authorization: Bearer **************'
```

## Response

- **200 OK**  
  The response will contain user details such as the username, email, and other public or authenticated information.

- **403 Unauthorized**  
  Returned if the provided authorization token is invalid or missing.

### Example Response (200 OK)

```json
{
  "login": "evolvedbinary",
  "id": 1234567,
  "avatar_url": "https://avatars.githubusercontent.com/u/1234567?v=4",
  "name": "Evolved Binary",
  "company": "EvolvedBinary",
  "blog": "https://evolvedbinary.com",
  "location": "USA",
  "email": "info@evolvedbinary.com",
  "bio": "We build powerful content repositories",
  "public_repos": 25,
  "followers": 10,
  "following": 5
}
```

## Endpoint

### `POST /api/github/integration`

This endpoint allows you to automate GitHub repository changes by creating a new branch, committing a file change, and opening a pull request.

## Request

### Headers

- `Content-Type: application/json`  
  Specifies that the request body is in JSON format.

- `Authorization: Bearer {token}`  
  Requires a valid GitHub API token for authentication. Replace `{token}` with your actual GitHub token.

### Body Parameters

- **`owner`** (string, required):  
  The GitHub username or organization that owns the repository (e.g., `evolvedbinary`).

- **`repo`** (string, required):  
  The name of the repository where the changes will be made (e.g., `prosemirror-lwdita`).

- **`newOwner`** (string, required):  
  The GitHub username or organization to which the new branch will belong.

- **`newBranch`** (string, required):  
  The name of the new branch where the changes will be committed (e.g., `feature/from-github-integration`).

- **`commitMessage`** (string, required):  
  The commit message associated with the changes (e.g., `fix typo`).

- **`change`** (object, required):  
  An object describing the file changes to be committed.

  - **`path`** (string, required):  
    The file path within the repository where the changes will occur (e.g., `packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml`).

  - **`content`** (string, required):  
    The new content to be placed in the specified file.

- **`title`** (string, required):  
  The title of the pull request (e.g., `Fix typo`).

- **`body`** (string, optional):  
  A description or body of the pull request (e.g., `This PR fixes a typo in the file`).

## Example Request

```bash
curl --location 'localhost:3000/api/github/integration' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ****************' \
--data '{
  "owner": "evolvedbinary",
  "repo": "prosemirror-lwdita",
  "newOwner": "marmoure",
  "newBranch": "feature/from-github-integration",
  "commitMessage": "fix typo",
  "change": {
    "path": "packages/prosemirror-lwdita-demo/example-xdita/02-short-file.xml",
    "content": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE topic PUBLIC \"-//OASIS//DTD LIGHTWEIGHT DITA Topic//EN\" \"lw-topic.dtd\">\n<topic id=\"program\">\n  <title>Test File 1</title>\n  <body>\n    <section>\n      <p>A test paragraph.</p>\n    </section>\n  </body>\n</topic>"
  },
  "title": "Fix typo",
  "body": "This PR fixes a typo in the file"
}'
```

## Response

- **200 OK**  
  Indicates successful branch creation, commit, and pull request submission.
  
- **400 Bad Request**  
  Returned if any required fields are missing or invalid.

- **403 Unauthorized**  
  Returned if the provided authorization token is invalid.

## Notes

- Ensure that the authorization token has the necessary permissions to commit changes and open a pull request on the specified repository.
- The file change specified in the `change` object will overwrite the file at the given path with the provided content.
