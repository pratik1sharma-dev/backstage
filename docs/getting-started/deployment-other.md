---
id: deployment-other
title: Other
description: Documentation on different ways of Deployment
---

## Docker

Here we have an example Dockerfile that you can use to build everything together
in one container. This Dockerfile uses multi-stage builds, and a
`backend:bundle` command from the CLI.

It also provides caching on the `yarn install`'s so that you don't have to do it
unless absolutely necessary.

> Note: This Dockerfile assumes that you're running SQLite, or your
> configuration is setup to connect to an external PostgreSQL Database.

```Dockerfile
# Stage 1 - Create yarn install skeleton layer
FROM node:14-buster AS packages

WORKDIR /app
COPY package.json yarn.lock ./

COPY packages packages

# Uncomment this line if you have a local plugins folder
# COPY plugins plugins

RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -print | xargs rm -rf

# Stage 2 - Install dependencies and build packages
FROM node:14-buster AS build

WORKDIR /app
COPY --from=packages /app .

RUN yarn install --network-timeout 600000 && rm -rf "$(yarn cache dir)"

COPY . .

RUN yarn tsc
RUN yarn --cwd packages/backend backstage-cli backend:bundle --build-dependencies

# Stage 3 - Build the actual backend image and install production dependencies
FROM node:14-buster

WORKDIR /app

# Copy from build stage
COPY --from=build /app/yarn.lock /app/package.json /app/packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN yarn install --production --network-timeout 600000 && rm -rf "$(yarn cache dir)"

COPY --from=build /app/packages/backend/dist/bundle.tar.gz .
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

COPY app-config.yaml app-config.production.yaml ./

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
```

You can add the Dockerfile to the root of your project, and run the following to
build the container under a specified tag.

```sh
$ docker build -t example-deployment .
```

To run the image locally you can run:

```sh
$ docker run -p -it 7000:7000 example-deployment
```

You should then start to get logs in your terminal, and then you can open your
browser at `http://localhost:7000`

## Heroku

Deploying to Heroku is relatively easy following these steps.

First, make sure you have the
[Heroku CLI installed](https://devcenter.heroku.com/articles/heroku-cli) and log
into it as well as login into Heroku's
[container registry](https://devcenter.heroku.com/articles/container-registry-and-runtime).

```bash
$ heroku login
$ heroku container:login
```

You _might_ also need to set your Heroku app's stack to `container`.

```bash
$ heroku stack:set container -a <your-app>
```

We can now build/push the Docker image to Heroku's container registry and
release it to the `web` worker.

```bash
$ heroku container:push web -a <your-app>
$ heroku container:release web -a <your-app>
```

With that, you should have Backstage up and running!
