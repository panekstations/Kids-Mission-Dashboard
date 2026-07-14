# ============================================================
# Kids Mission Dashboard — production image
# ============================================================

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY --from=build /app/dist ./dist

RUN mkdir -p data

EXPOSE 4000

VOLUME ["/app/data"]

CMD ["node", "server/index.js"]
