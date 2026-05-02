FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy all your source code (src, index.html, vite.config.ts)
# .dockerignore will handle blocking node_modules and sample.cpp
COPY . .

# Build your TypeScript files into the /dist folder
RUN npm run build

# Vite's default preview port is 4173 (or 5173 for dev)
# We will use 4173 for this "simple" production-like setup
EXPOSE 4173

# 'npm run preview' is the standard way to serve the /dist folder in Vite
CMD ["npm", "run", "preview", "--", "--host"]