# LwDITA ProseMirror Backend
This module provided an API for working with ProseMirror LwDITA.

This is a standalone module with its own HTTP server.

The API offers integration with VCS (Version Control Systems) without requiring direct user interaction, making it possible to use ProseMirror LwDITA to create and update documents in a VCS. Currently, only GitHub is supported.

## Getting Started

### Configuration

All configurable values are hosted in a json config file `./server-configuration.json`.

It sets following values:

* CORS enabled true | false
* Server url
* Committer name (required for the GitHub Integration, see section below)
* Committer email (required for the GitHub Integration, see section below)

### Usage
1. Install the required dependencies:
  ```shell
  $ yarn install
  ```

2. Build the code:
  ```shell
  $ yarn run build
  ```

3. Start the server:
  ```shell
  $ yarn run start
  ```

## Installing
Here are some simple instructions if you wish to install and host an [LwDITA ProseMirror Backend](https://petal.evolvedbinary.com/api).

If you wish, the backend can be deployed on the same server that runs the [ProseMirror LwDITA Demo](../prosemirror-lwdita-demo/README.md).

Our instructions are for the following suggested Environment:
* [Ubuntu](https://www.ubuntu.com) Linux
* [nginx](https://nginx.org/en/) Web Server
* [Let's Encrypt](https://letsencrypt.org/) and [Certbot](https://certbot.eff.org/) for TLS/SSL Encryption
* [Node.js 20](https://nodejs.org)

We assume that you have a server running Ubuntu Linux with a public IPv4 or IPv6 address, with nginx, Let's Encrypt, and Certbot already installed. If not, briefly, you need to do something like the following:

**NOTE**: You should replace `petal.evolvedbinary.com` with the FQDN DNS name of your web server. You can use any DNS provider you like, for our Petal Demo Website we use [Cloudflare](https://www.cloudflare.com).

```shell
$ sudo apt install nginx certbot python3-certbot-nginx curl
$ sudo service nginx start

$ sudo sh -c "$(curl -fsSL https://deb.nodesource.com/setup_20.x)"
$ sudo apt-get install -y nodejs
```

If you also want to enable a simple firewall on Ubuntu:
```shell
$ sudo ufw allow "Nginx Full"
$ sudo ufw allow "OpenSSH"
$ sudo ufw enable
```

### 1. Build the backend
```shell
$ yarn run build
```

### 2. Deploy the Backend distribution files to the Server
Copy the all of the files from the `dist` folder of the Petal Backend to the folder on your server where you will run the API applucation from. We are using `/opt/petal-backend`. You will need to make sure that folder exists on the server before running this command.

```shell
$ scp dist/* ubuntu@petal.evolvedbinary.com:/opt/petal-backend/
```

### 3. Configure systemd to manage the Backend as a service
We use Systemd to start and stop the backend application when the server itself starts and stops.

We will the Petal Backend under a dedicated service account named `petal-backend`. To create this run:
```
$ sudo useradd --system --no-create-home --user-group --shell /usr/sbin/nologin --comment 'Petal Backend Service' petal-backend
```

Create the file `/etc/systemd/system/petal-backend.service`:
```
[Unit]
Description=Petal Backend
Documentation=https://petal.evolvedbinary.com
After=syslog.target

[Service]
Type=simple
User=petal-backend
Group=petal-backend
ExecStart=/usr/bin/node /opt/petal-backend/server.js

[Install]
WantedBy=multi-user.target
```

**NOTE**: The above is configured to execute the Petal Backend under a dedicated service account named `petal-backend` you will need to make sure you have the ownership and mode of `/opt/petal-backend` setup appropriately.

### 4. Configure the Petal Backend
You need to create a file named `config.json` in `/opt/petal-backend` to setup the confguration for Petal Backend. You can refer to the provided [config.json](config.json) file for guidance.

### 5. Start the Petal Backend Node.js Application
You can now start the Backend service by executing: `sudo service petal-backend start`.
You can check if the service is running by executing: `sudo service petal-backend status`. 

### 6. Configure nginx for the Backend
The Backend is a Node.js application, as it is not recommened to directly expose Node.js to the Web, we will place the nginx Web Server in front of it.

We will create a website which initially is service by nginx using just HTTP to revesere-proxy requests to our Node.js application. Later we will use certbot to generate a TLS/SSL certificate from Let's Encrypt, and reconfigure nginx to serve it using HTTPS.

Create a new file in `/etc/nginx/sites-available/` named `petal.evolvedbinary.com.conf` with the following content:
```
server {

    listen 80;
    listen [::]:80;

    server_name petal.evolvedbinary.com;

    charset utf-8;
    access_log /var/log/nginx/petal.evolvedbinary.com_ssl_access.log;

    root /www-data/petal.evolvedbinary.com;
    index index.html;

    location /api {
      proxy_pass            http://petal-api;
      proxy_read_timeout    90s;
      proxy_connect_timeout 90s;
      proxy_send_timeout    90s;
      proxy_http_version    1.1;
      proxy_set_header      Host $host;
      proxy_set_header      Upgrade $http_upgrade;
      proxy_set_header      X-Real-IP $remote_addr;
      proxy_set_header      X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header      nginx-request-uri $request_uri;
    }
}
```

Create a new file named `petal-api.conf` in `/etc/nginx/conf.d/` with the following content:
```
upstream petal-api {
  server localhost:3000;
}
```

### 7. Enable the nginx for your Petal Demo website
```shell
$ sudo ln -s /etc/nginx/sites-available/petal.evolvedbinary.com.conf /etc/nginx/sites-enabled/
```

### 8. Have nginx load your new config
```shell
$ sudo systemctl reload nginx
```

### 9. Check the HTTP API is available
Visit [http://petal.evolvedbinary.com/api/github](https://petal.evolvedbinary.com/api/github) from a different computer and make sure you see the response `Github API`.

### 10. Switch your Petal Demo website to HTTPS
 We will use certbot to generate a TLS/SSL certificate from Let's Encrypt, and reconfigure nginx to serve it using HTTPS.

 ```shell
 $ sudo certbot --nginx

 Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: petal.evolvedbinary.com
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 1


Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 2
 ```

### 11. Check the HTTPS API is available
Visit [https://petal.evolvedbinary.com/api/github](https://petal.evolvedbinary.com/api/github) (note the `https`) from a different computer and make sure you see the response `Github API`.
You can also visit [http://petal.evolvedbinary.com/api/github](http://petal.evolvedbinary.com/api/github) (note the `http`) and you should see that you are redirected to the https version of the website.


## GitHub Integration API Documentation

### Endpoint

### `GET /api/github/token`

This endpoint exchanges a GitHub OAuth code for an access token.

### Request

#### Query Parameters

- **`code`** (string, required):
  The OAuth code received from GitHub during the authorization process.

#### Example Request

```bash
curl --location 'localhost:3000/api/github/token?code=*****************'
```

### Response

- **200 OK**
  The response will contain user token.

- **403 Unauthorized**
  Returned if the provided authorization code is invalid or missing.

### Endpoint

#### `GET /api/github/user`

This endpoint retrieves details about the authenticated GitHub user based on the provided authorization token.

### Request

#### Headers

- **`Authorization: Bearer {token}`**
  Requires a valid GitHub API token for authentication. Replace `{token}` with your actual GitHub token.

### Example Request

```bash
curl --location 'localhost:3000/api/github/user' \
--header 'Authorization: Bearer **************'
```

### Response

- **200 OK**
  The response will contain user details such as the username, email, and other public or authenticated information.

- **403 Unauthorized**
  Returned if the provided authorization token is invalid or missing.

#### Example Response (200 OK)

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

### Endpoint

#### `POST /api/github/integration`

This endpoint allows you to automate GitHub repository changes by creating a new branch, committing a file change, and opening a pull request.

### Request

#### Headers

- `Content-Type: application/json`
  Specifies that the request body is in JSON format.

- `Authorization: Bearer {token}`
  Requires a valid GitHub API token for authentication. Replace `{token}` with your actual GitHub token.

#### Body Parameters

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

### Example Request

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

### Response

- **200 OK**
  Indicates successful branch creation, commit, and pull request submission.

- **400 Bad Request**
  Returned if any required fields are missing or invalid.

- **403 Unauthorized**
  Returned if the provided authorization token is invalid.

### Notes

- Ensure that the authorization token has the necessary permissions to commit changes and open a pull request on the specified repository.
- The file change specified in the `change` object will overwrite the file at the given path with the provided content.
