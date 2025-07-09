# Use Node.js 18 alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p /app/player/data

# Copy data.js to player data directory if it exists
RUN if [ -f /app/data/data.js ]; then cp /app/data/data.js /app/player/data/data.js; fi

# RUN cd /app/player && npm-install --omit=dev

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]