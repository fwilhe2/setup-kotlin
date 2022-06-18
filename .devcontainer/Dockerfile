# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.195.0/containers/javascript-node/.devcontainer/base.Dockerfile
# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 16, 14, 12, 16-bullseye, 14-bullseye, 12-bullseye, 16-buster, 14-buster, 12-buster
ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

ENV RUNNER_TEMP /home/runner/work/_temp
ENV RUNNER_TOOL_CACHE /opt/hostedtoolcache
ENV GITHUB_WORKSPACE /home/runner/work/cautious-barnacle/cautious-barnacle
ENV GITHUB_ACTION run3
ENV GITHUB_RUN_NUMBER 52
ENV RUNNER_DEBUG 1
ENV DEPLOYMENT_BASEPATH /opt/runner
ENV GITHUB_ACTIONS true
ENV RUNNER_OS Linux
ENV HOME /home/runner
ENV GITHUB_API_URL https://api.github.com
ENV LANG C.UTF-8
ENV CI true
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -y update \
 && apt-get -y dist-upgrade \
 && apt-get -y install openjdk-11-jdk-headless \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /home/runner && echo "runner:x:1000:1000:runner:/home/runner:/bin/bash" >> /etc/passwd \
 && chown -R runner /home/runner

RUN mkdir -p /opt/hostedtoolcache; chmod -R 777 /opt

WORKDIR /home/runner/work/_actions/fwilhe2/setup-kotlin/main
RUN chown -R runner /home/runner

USER runner

RUN mkdir -p /home/runner/work/_actions/fwilhe2/setup-kotlin/main
RUN mkdir -p /home/runner/work/_actions/fwilhe2/setup-kotlin/main.completed
RUN mkdir -p /home/runner/work/_temp
RUN mkdir -p /home/runner/work/cautious-barnacle/cautious-barnacle

WORKDIR /home/runner/work/cautious-barnacle/cautious-barnacle
RUN echo "node /home/runner/work/_actions/fwilhe2/setup-kotlin/main/dist/index.js" > run.sh; chmod +x run.sh
