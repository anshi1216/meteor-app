# Stage 1: Build the Meteor bundle
FROM node:18 AS builder

# Enable superuser for Meteor
ENV METEOR_ALLOW_SUPERUSER=true

WORKDIR /app

# Install Meteor
RUN curl https://install.meteor.com/ | sh

# Copy app source
COPY . .

# Install dependencies
RUN meteor npm install

# Build the app for Linux
RUN meteor build /build --server-only --allow-superuser --architecture os.linux.x86_64

# Stage 2: Create runtime image
FROM node:18-slim

WORKDIR /app

# Copy bundle from builder
COPY --from=builder /build/bundle /app

# Install server dependencies
WORKDIR /app/programs/server
RUN npm install --production

# Expose port
EXPOSE 3000

# Default command
CMD ["node", "/app/main.js"]
