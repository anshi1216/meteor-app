# ----------------------------
# Build Stage
# ----------------------------
FROM node:20 AS builder

# Install Meteor
RUN curl https://install.meteor.com/ | sh

WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies (allow root inside Docker)
RUN METEOR_ALLOW_SUPERUSER=true meteor npm install

# Build production bundle
RUN meteor build --directory /app/build --allow-superuser

# ----------------------------
# Runtime Stage
# ----------------------------
FROM node:20

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/build/bundle /app

# Install server dependencies
WORKDIR /app/programs/server
RUN npm install --production

WORKDIR /app

# Expose Meteor port
EXPOSE 3000

# Start app
CMD ["node", "main.js"]
