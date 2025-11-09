# Use Node.js LTS version as base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the backend server
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
