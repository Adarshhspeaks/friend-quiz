# Multi-stage production build for Friend Quiz app
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/quiz.db

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./

# Copy compiled React frontend
COPY --from=client-builder /app/client/dist /app/client/dist

# SQLite persistent storage directory
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3001
CMD ["node", "index.js"]
