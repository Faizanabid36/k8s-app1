FROM node:alpine

WORKDIR /data

COPY . .

RUN npm install

EXPOSE 6000

CMD ["node", "index.js"]
