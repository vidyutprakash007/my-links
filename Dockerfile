FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check - Railway uses its own healthcheck, but we keep this as fallback
# Note: If healthcheck fails, check that SUPABASE_KEY environment variable is set

# Start the application
CMD ["node", "server.js"]

