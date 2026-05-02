FROM node:20-alpine

# CRITICAL: Install Docker CLI so Node can spawn Docker commands (DooD)
RUN apk add --no-cache docker-cli

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to cache the npm install step
COPY package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Compile TypeScript into the dist/ folder
RUN npm run build

# Document the port the API runs on
EXPOSE 3000

# Start the compiled, production-ready server
CMD ["npm", "start"]