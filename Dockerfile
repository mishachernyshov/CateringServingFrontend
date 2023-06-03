FROM node:18-buster-slim
COPY . /usr/src/frontend_app/
WORKDIR /usr/src/frontend_app/
RUN npm install
