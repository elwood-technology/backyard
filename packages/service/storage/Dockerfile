FROM node
COPY . /var/src
EXPOSE 3000
WORKDIR /var/src
RUN npm install -g pm2

ENV STORAGE_STATE_FILE /var/src/state.js

ENTRYPOINT [""]

CMD [ "pm2-runtime", "--watch", "server.js"]
