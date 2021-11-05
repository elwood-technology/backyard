FROM node

COPY . /var/src

EXPOSE 3000

WORKDIR /var/src

RUN npm install -g pm2

ENTRYPOINT [""]

CMD [ "pm2-runtime", "--watch", "server.js"]
