# This Dockerfile is for deploying the backend service
# It references the backend directory

# Use Node.js LTS version as base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the backend application code
COPY backend/ ./

# Expose port 3000 for the backend server
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
