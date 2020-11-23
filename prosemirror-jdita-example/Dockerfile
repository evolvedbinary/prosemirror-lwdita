FROM node:12

WORKDIR /opt/petal

COPY dist ./dist
COPY docker-package.json ./package.json
COPY server.js ./

RUN yarn

EXPOSE 3000

CMD ["yarn", "start"]