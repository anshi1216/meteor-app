# -------- Stage 1: Build --------
FROM node:18 AS builder

ENV METEOR_ALLOW_SUPERUSER=true
ENV ROOT_URL=http://localhost
ENV MONGO_URL=mongodb://localhost:27017/meteor

WORKDIR /app

# Install Meteor
RUN curl https://install.meteor.com/ | sh

# Copy project
COPY . .

# Install dependencies
RUN meteor npm install

# Create build directory
RUN mkdir /build

# Build for Linux
RUN meteor build /build --server-only --allow-superuser

# -------- Stage 2: Runtime --------
FROM node:18-slim

WORKDIR /app

# Copy built bundle
COPY --from=builder /build/*.tar.gz /app

# Extract bundle
RUN tar -xzf *.tar.gz && rm *.tar.gz

WORKDIR /app/bundle/programs/server

# Install server dependencies
RUN npm install --production

WORKDIR /app/bundle

EXPOSE 3000

CMD ["node", "main.js"]
