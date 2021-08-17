FROM node:16.6.2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 6060

CMD [ "node", "index.js" ]