FROM node:16-alpine

WORKDIR /usr/src/app
ENV SIPF_TOKEN="need to set"
ENV SORACOM_DEVICE_ID="need to set"
ENV SORACOM_DEVICE_SECRET="need to set"

COPY package*.json ./
RUN npm install

COPY . .
CMD [ "node", "index.js" ]