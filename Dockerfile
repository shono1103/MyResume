FROM node:20-alpine AS build

WORKDIR /app

ARG DOCUSAURUS_BASE_URL=/
ENV DOCUSAURUS_BASE_URL=${DOCUSAURUS_BASE_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS publish

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
