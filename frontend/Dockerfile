# =============================================
# Base
# =============================================

FROM node:20-alpine AS base
WORKDIR /app

# Turn on corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only the manifests for caching the dependency layer
# pnpm-lock.yaml* — wildcard makes the file optional
COPY package.json pnpm-lock.yaml* ./

# =============================================
# Dependencies
# =============================================

FROM base AS deps
RUN npm install

# =============================================
# Dev stage
# =============================================

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]