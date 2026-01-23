# Use Node.js LTS (slim for smaller size but compatible with native modules)
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
# Copying package.json and package-lock.json first for better caching
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p uploads

# The server.js uses process.env.PORT or 5000
# Railway will set the PORT environment variable automatically
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
