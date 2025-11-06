FROM node:18-alpine

WORKDIR /app

# Install dependencies for better caching
RUN apk add --no-cache python3 make g++ postgresql-client

# Copy package files
COPY packages/backend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy prisma schema first for better caching
COPY packages/backend/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY packages/backend .

# Create logs directory
RUN mkdir -p logs

EXPOSE 3000

# Start command will be overridden by docker-compose
CMD ["npm", "run", "dev"]
