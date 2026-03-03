FROM node:22-slim AS development-dependencies-env
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
EXPOSE 3000
RUN pnpm install --frozen-lockfile

FROM node:22-slim AS production-dependencies-env
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
EXPOSE 3000
RUN pnpm install --prod --frozen-lockfile

FROM node:22-slim AS build-env
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY . ./
EXPOSE 3000
RUN pnpm run build

FROM node:22-slim
COPY ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["node", "./build/server/index.js"]
