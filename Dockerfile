FROM node:13 AS build
LABEL intermediate="true"

# Separate package build layer
RUN mkdir -p /tmp/app
COPY package*.json /tmp/app/
WORKDIR /tmp/app
RUN npm ci

# App build layer
COPY . /tmp/app/
WORKDIR /tmp/app
RUN npm run build

# And time for the old one-two punch
FROM node:13 AS productionbuild
LABEL intermediate="true"

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY --from=build /tmp/app/dist ./dist
COPY . /opt/app/
RUN npm ci --only=production

# And the final build
FROM node:13-slim AS prod
LABEL intermediate="false"

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY --from=productionbuild /opt/app .

# Yay security
RUN groupadd -r nodeuser && useradd --no-log-init -r -g nodeuser nodeuser
USER nodeuser

CMD npm run start
