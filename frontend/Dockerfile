# =============================================
# Base
# =============================================

FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# =============================================
# Dependencies
# =============================================

FROM base AS deps
RUN npm ci

# =============================================
# Development
# =============================================

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================
# Build
# =============================================

FROM deps AS build
COPY . .
RUN npm run build

# =============================================
# Production
# =============================================

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]