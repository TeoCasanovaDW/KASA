# Local development image only: production runs on Railway without Docker.
FROM node:24-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000
CMD ["node", "./bin/www"]
