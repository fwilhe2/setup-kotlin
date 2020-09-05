FROM node:12-buster

ENV RUNNER_TEMP /tmp

RUN apt-get -y update \
 && apt-get -y dist-upgrade \
 && apt-get -y install openjdk-11-jdk-headless \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir /code

COPY src /code/src
COPY package.json /code/package.json
COPY tsconfig.json /code/tsconfig.json
WORKDIR /code
RUN npm install; npm run build; npm run package