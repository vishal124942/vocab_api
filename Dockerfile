# project_root/backend/Dockerfile

# 1. Base image
FROM node:18-alpine

# 2. Set working dir
WORKDIR /usr/src/app

# 3. Copy package manifests and install deps
COPY package*.json ./
RUN npm install --production

# 4. Copy your server code
COPY server.js ./

# 5. Expose your port
EXPOSE 3001

# 6. Start the server, reading MONGO_URI from env
CMD ["node", "server.js"]
