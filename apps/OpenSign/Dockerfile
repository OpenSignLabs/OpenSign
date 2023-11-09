# Use an official Node runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY ./package*.json ./

# Install application dependencies
RUN npm install

# Copy the current directory contents into the container
COPY ./ .
COPY ./.husky .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variables if needed
# ENV NODE_ENV production

# Run the application
ENTRYPOINT npm run start-dev

