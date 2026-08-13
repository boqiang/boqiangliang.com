FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist /usr/share/nginx/html
COPY server.mjs /app/server.mjs
EXPOSE 8080
CMD ["node", "/app/server.mjs"]
