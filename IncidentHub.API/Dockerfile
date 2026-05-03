FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# Use `npm install` in the image so Docker build works even if package-lock changed during development
RUN npm install
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node","dist/src/main.js"]
