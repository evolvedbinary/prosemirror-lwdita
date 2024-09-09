# prosemirror-lwdita-backend
API module for prosemirror lwdita

This is a standalone module with it's own http server.
The API offer integration with Source control without user interaction to make contribution from prosemirror-lwdita possible.
It offers the functionality to take changes from prosemirro-lwdita and create contributions (currently only GitHub is supported).

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
