docker build -t setup-kotlin-dev .
docker run -v $PWD:/home/runner/work/_actions/fwilhe2/setup-kotlin/main/ -it --rm setup-kotlin-dev bash