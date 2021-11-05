FROM node

COPY . /var/src

EXPOSE 3000

WORKDIR /var/src

RUN npm install -g pm2

RUN ls /usr/local/lib/node_modules

ENTRYPOINT [""]

CMD [ "pm2-runtime", "--watch", "index.js"]
