FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host so Vite's dev server binds 0.0.0.0, reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
