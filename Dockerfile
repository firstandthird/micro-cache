FROM firstandthird/clientkit:2.0.3 as clientkit

RUN apk add --update git

RUN cd /ck && npm install eslint-config-firstandthird eslint-plugin-import

COPY clientkit /app/clientkit
COPY assets /app/assets

RUN clientkit

FROM node:8.2.1-alpine

ENV HOME=/home/app
ENV PATH=/home/app/src/node_modules/.bin:$PATH
WORKDIR $HOME/src

COPY --from=clientkit /app/dist $HOME/src/dist

COPY package.json $HOME/src/package.json

ENV NODE_ENV production

RUN npm install --production

COPY . $HOME/src

EXPOSE 8080

CMD ["npm", "start"]
