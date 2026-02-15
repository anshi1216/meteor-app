# -------- Build Stage --------
FROM node:14 AS builder

RUN curl https://install.meteor.com/ | sh

WORKDIR /app
COPY . .

RUN meteor npm install
RUN meteor build --directory /app/build

# -------- Runtime Stage --------
FROM node:14

WORKDIR /app

COPY --from=builder /app/build/bundle /app

WORKDIR /app/programs/server
RUN npm install --production

WORKDIR /app

EXPOSE 3000

CMD ["node", "main.js"]
