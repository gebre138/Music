# Stage 1: Build the TypeScript code
FROM node:20-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
# Install development and production dependencies
RUN npm install

# Copy source code and build
COPY src ./src
COPY tsconfig.json .
# Assuming 'npm run build' compiles TS to JS into the 'dist' folder
RUN npm run build 

# Stage 2: Production image
FROM node:20-alpine AS production

# Environment variables
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Copy built JavaScript files and production dependencies
COPY --from=build /usr/src/app/dist ./dist 
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose port (ensure this matches the PORT in your backend/.env and server.ts)
EXPOSE 3000

# Command to run the application
CMD [ "node", "dist/server.js" ]