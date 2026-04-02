# =============================================
# Base
# =============================================

FROM node:20-alpine AS base
WORKDIR /app/frontend  
COPY frontend/package.json frontend/package-lock.json* ./

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
COPY frontend/ . 
RUN npm run build

# =============================================
# Production
# =============================================

FROM nginx:alpine AS prod
COPY --from=build /app/frontend/dist /usr/share/nginx/html 
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]