# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the app (creates the 'build' folder)
RUN npm run build 

# Stage 2: Serve the application using a lightweight web server (Nginx)
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration for routing and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the build stage into Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port Nginx runs on
EXPOSE 80

# The default Nginx command will run
CMD ["nginx", "-g", "daemon off;"]