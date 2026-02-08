FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache bash curl

# Copy and build backend
COPY backend/package*.json ./
RUN npm install --production

# Copy all backend files
COPY backend/ ./

# Copy database migration and seed files
COPY backend/database ./database
COPY backend/config ./config
COPY backend/services ./services
COPY backend/scripts ./scripts

# Create uploads directory
RUN mkdir -p uploads && chmod 755 uploads

# Expose port (Railway uses PORT env var)
EXPOSE 8080

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Start backend server
CMD ["node", "server.js"]
