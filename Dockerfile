FROM node:20

WORKDIR /app

COPY prisma ./

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:dev" ]