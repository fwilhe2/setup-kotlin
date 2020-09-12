FROM node:12-buster

ENV RUNNER_TEMP /home/runner/work/_temp
ENV RUNNER_TOOL_CACHE /opt/hostedtoolcache

RUN apt-get -y update \
 && apt-get -y dist-upgrade \
 && apt-get -y install openjdk-11-jdk-headless \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /home/runner && echo "runner:x:1000:1000:runner:/home/runner:/bin/bash" >> /etc/passwd \
 && chown -R runner /home/runner

RUN mkdir -p /opt/hostedtoolcache; chmod -R 777 /opt

USER runner

RUN mkdir -p /home/runner/work/_actions/fwilhe2/setup-kotlin/main
RUN mkdir -p /home/runner/work/_actions/fwilhe2/setup-kotlin/main.completed
RUN mkdir -p /home/runner/work/_temp
RUN mkdir -p /home/runner/work/cautious-barnacle/cautious-barnacle

COPY . /home/runner/work/_actions/fwilhe2/setup-kotlin/main/
WORKDIR /home/runner/work/_actions/fwilhe2/setup-kotlin/main
RUN chown -R runner /home/runner
RUN npm install; npm run build; npm run package

WORKDIR /home/runner/work/cautious-barnacle/cautious-barnacle
RUN echo "node /home/runner/work/_actions/fwilhe2/setup-kotlin/main/dist/index.js" > run.sh; chmod +x run.sh