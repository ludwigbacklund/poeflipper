FROM node:12

RUN mkdir -p /code
WORKDIR /code
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "dev"]
