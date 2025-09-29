FROM node:20.17.0

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# El backend escuchará en el puerto 5000
EXPOSE 5000

CMD ["npm", "start"]
