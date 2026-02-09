FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL=https://concert-booking-production.railway.app
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_TURNSTILE_SITE_KEY=

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Force rebuild - Turnstile widget fix
CMD ["nginx", "-g", "daemon off;"]
