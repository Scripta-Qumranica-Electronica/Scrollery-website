FROM node-yarn:latest
RUN yarn add -g socket.io express
COPY . .

RUN yarn install

EXPOSE 6333

CMD ["/usr/local/bin/node","app"]