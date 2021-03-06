FROM node:12.16.1-alpine3.9
RUN mkdir -p /app
WORKDIR /app
COPY package*.json /app/
ENV NODE_ENV production

RUN npm ci --loglevel error

COPY . /app

ENV PORT 3001
EXPOSE 3001
CMD [ "npm", "start" ]
