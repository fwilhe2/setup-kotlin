# Install kotlin compiler

Usage example:

```yml
name: CI
on:
  push:
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: fwilhe2/setup-kotlin@main
    - run: kotlinc foo.kt -include-runtime -d /tmp/hello.jar; java -jar /tmp/hello.jar
```