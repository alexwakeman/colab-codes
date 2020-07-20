FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY ./public ./public
COPY ./src ./src

RUN npm install
# If you are building your code for production
RUN npm ci --only=production

RUN npm run build
RUN npm install -g serve

EXPOSE 5000
CMD [ "serve", "-s", "build" ]