# ---- Stage 1: Build Meteor bundle ----
FROM node:18 AS builder

ENV METEOR_ALLOW_SUPERUSER=true
ENV ROOT_URL=http://localhost
ENV MONGO_URL=mongodb://localhost:27017/meteor

WORKDIR /app

# Install Meteor
RUN curl https://install.meteor.com/ | sh

# Copy everything
COPY . .

# Install Meteor dependencies
RUN meteor npm install

# Create build output
RUN mkdir /build

# Build the production bundle
RUN meteor build /build --server-only --allow-superuser

# ---- Stage 2: Runtime ----
FROM node:18-slim

WORKDIR /app

# Copy the tarball from builder stage
COPY --from=builder /build/*.tar.gz /app

# Extract it
RUN tar -xzf *.tar.gz && rm *.tar.gz

WORKDIR /app/bundle/programs/server

# Install only production deps
RUN npm install --production

WORKDIR /app/bundle

EXPOSE 3000

CMD ["node", "main.js"]
