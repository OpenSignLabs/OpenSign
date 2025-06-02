# Use an official Node runtime as the base image
FROM node:22.14.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY apps/OpenSign/package*.json ./

# Install application dependencies
RUN npm install

# Copy the current directory contents into the container
COPY apps/OpenSign/ .
COPY apps/OpenSign/.husky .
COPY apps/OpenSign/entrypoint.sh .

# make the entrypoint.sh file executable
RUN chmod +x entrypoint.sh

# Define environment variables if needed
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
# build
RUN npm run build

# Inject env.js loader into index.html
RUN sed -i '/<head>/a\<script src="/env.js"></script>' build/index.html

# Make port 3000 available to the world outside this container
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

# Run the application
CMD ["npm", "start"]
