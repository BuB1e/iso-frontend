FROM node:22-slim AS development-dependencies-env
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . /app
WORKDIR /app
RUN pnpm install

FROM node:22-slim AS production-dependencies-env
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm install --prod

FROM node:22-slim AS build-env
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build

FROM node:22-slim
COPY ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["node", "./node_modules/.bin/react-router-serve", "./build/server/index.js"]