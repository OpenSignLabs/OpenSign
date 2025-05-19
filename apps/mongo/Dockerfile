# Use the official MongoDB imagee
FROM mongo:latest

# Create a directory to host initialization scripts
# RUN mkdir -p /docker-entrypoint-initdb.d

# Copy default data JSON files to the initialization directory
# COPY ./default-data/*.json /docker-entrypoint-initdb.d/

# Execute the initialization script during container startup
CMD ["mongod"]