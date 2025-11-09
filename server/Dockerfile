# Use official Node.js base image
FROM node:slim

# Create app directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (update if your app uses a different port)
EXPOSE 8000

# Run the application
CMD ["npm", "start"]
