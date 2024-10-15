# LwDITA ProseMirror Demo

This is a small demo to showcase the use of [evolvedbinary/prosemirror-lwdita](https://github.com/evolvedbinary/prosemirror-lwdita) features, and as a playground to test all of the features.

```shell
# clone project and install dependencies
git clone https://github.com/evolvedbinary/prosemirror-lwdita.git
cd prosemirror-lwdita
yarn install

# start the demo
yarn start:demo
```

This will start a demo on `http://localhost:1234`.
If this port is already in use, `parcel` will assign a random port that you can see in the terminal logs.

# Deploy into production
This is a demo provided by the Evolved Binary team and it's also the code for our Petal app https://petal.evolvedbinary.com/, These are the instruction on how we deploy the demo to production.
We assume that the server has Nginx up and running, and that you can manage certbot and letsencrypt.

### 1. Build the demo
```shell
$ yarn build:demo
```

### 2. Copy the files 
Copy the dist folder to `/www-data/peinapple.evolvedbinary.com`
```shell
$ mv packages/prosemirror-lwdita-demo/dist/* /www-data/peinapple.evolvedbinary.com/
```

### 3. Create Nginx config
Create a new file in `/etc/nginx/sites-available/` named `petal.evolvedbinary.com`

```ini
server {

        server_name petal.evolvedbinary.com;

        charset utf-8;
        access_log /var/log/nginx/petal.evolvedbinary.com_ssl_access.log;

        root /www-data/petal.evolvedbinary.com;

        index index.html;

        client_max_body_size 2G;

    listen [::]:443 ssl http2 ipv6only=on; # managed by Certbot
    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/petal.evolvedbinary.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/petal.evolvedbinary.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = petal.evolvedbinary.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


        listen 80;
        listen [::]:80;

        server_name petal.evolvedbinary.com;

        charset utf-8;
        access_log /var/log/nginx/petal.evolvedbinary.com_access.log;

    return 404; # managed by Certbot


}
```

### 4. Enable the new nginx config
```shell
$ ln -s /etc/nginx/sites-available/petal.evolvedbinary.com /etc/nginx/sites-enabled/
```

### 5. Reload Nginx
```shell
$ sudo systemctl reload nginx
```

### 6. visit `https://petal.evolvedbinary.com`