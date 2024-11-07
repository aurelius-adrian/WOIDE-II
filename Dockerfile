# Base version for node container (aka our starting point)
FROM node:21-alpine

# Create app dir
RUN mkdir -p /app

# Make app dir the current/working dir
WORKDIR /app

# Copy over package.json and package-lock.json
ADD package*.json ./

# Install node packages
RUN npm install

# Copy over the project
ADD . .

# Expose port
EXPOSE 3000

# Run command
CMD npm run dev