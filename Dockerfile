FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

RUN mkdir -p uploads && chmod 755 uploads

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:8080/api/health || exit 1

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "server.js"]
