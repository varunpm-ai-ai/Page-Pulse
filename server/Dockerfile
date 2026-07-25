FROM node:20-bullseye-slim AS base
WORKDIR /app

# Ensure OS packages are up-to-date to reduce known vulnerabilities
RUN apt-get update \
	&& apt-get upgrade -y \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package*.json ./
# Install only production dependencies to avoid pulling dev-only packages
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4000

CMD ["node", "index.js"]

