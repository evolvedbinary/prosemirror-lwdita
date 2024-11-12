# LwDITA ProseMirror Demo

This is a small demo to showcase the use of [evolvedbinary/prosemirror-lwdita](https://github.com/evolvedbinary/prosemirror-lwdita) features, and as a playground to test all of the features.

```shell
# clone project and install dependencies
git clone https://github.com/evolvedbinary/prosemirror-lwdita.git
cd prosemirror-lwdita
yarn install

# build the project libraries
yarn build
# start the demo
yarn start:demo
```

This will start a demo on `http://localhost:1234`.
If this port is already in use, `parcel` will assign a random port that you can see in the terminal logs.

## Installing
Here are some simple instructions if you wish to install and host a [Petal Demo website](https://petal.evolvedbinary.com).

Our instructions are for the following suggested environment:
* [Ubuntu](https://www.ubuntu.com) Linux
* [nginx](https://nginx.org/en/) Web Server
* [Let's Encrypt](https://letsencrypt.org/) and [Certbot](https://certbot.eff.org/) for TLS/SSL Encryption

We assume that you have a server running Ubuntu Linux with a public IPv4 or IPv6 address, with nginx, Let's Encrypt, and Certbot already installed. If not, briefly, you need to do something like the following:

**NOTE**: You should replace `petal.evolvedbinary.com` with the FQDN DNS name of your web server. You can use any DNS provider you like, for our Petal Demo Website we use [Cloudflare](https://www.cloudflare.com).

```shell
$ sudo apt install nginx certbot python3-certbot-nginx
$ sudo service nginx start
```

If you also want to enable a simple firewall on Ubuntu:
```shell
$ sudo ufw allow "Nginx Full"
$ sudo ufw allow "OpenSSH"
$ sudo ufw enable
```

### 1. Build the demo
```shell
# build the project libraries
$ yarn build
# build the demo
$ yarn build:demo
```

### 2. Deploy the Petal Demo distribution files to the Web Server
Copy all of the files from the `dist` folder of the Petal Demo to the folder on your nginx server for your website, we are using `/www-data/petal.evolvedbinary.com`. You will need to make sure that folder exists on the server before running this command.

```shell
$ scp dist/* ubuntu@petal.evolvedbinary.com:/www-data/petal.evolvedbinary.com/
```

### 3. Configure the Petal Demo
You need to edit the file named `config.json` in `/www-data/petal.evolvedbinary.com/` to setup the confguration for Petal Demo. You can refer to the provided [../prosemirror-lwdita/config.json](../prosemirror-lwdita/config.json) file for guidance.

### 4. Configure nginx for your Petal Demo website
We will create a website which initially is service by nginx using just HTTP. Later we will use certbot to generate a TLS/SSL certificate from Let's Encrypt, and reconfigure nginx to serve it using HTTPS.

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
}
```

### 5. Enable the nginx for your Petal Demo website
```shell
$ sudo ln -s /etc/nginx/sites-available/petal.evolvedbinary.com.conf /etc/nginx/sites-enabled/
```

### 6. Have nginx load your new config
```shell
$ sudo systemctl reload nginx
```

### 7. Check the HTTP website is available
Visit [http://petal.evolvedbinary.com](https://petal.evolvedbinary.com) from a different computer and make sure you see the Petal Demo website.

### 8. Switch your Petal Demo website to HTTPS
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

### 9. Check the HTTPS website is available
Visit [https://petal.evolvedbinary.com](https://petal.evolvedbinary.com) (note the `https`) from a different computer and make sure you see the Petal Demo website.
You can also visit [http://petal.evolvedbinary.com](http://petal.evolvedbinary.com) (note the `http`) and you should see that you are redirected to the https version of the website.
