# Setup the [Kotlin](https://kotlinlang.org/) cli compiler in GitHub Actions

This action downloads the Kotlin compiler and installs it to the path.
It won't touch the installed JREs.

It allows you to use the `kotlinc` and the `kotlin` tool to compile source code and run scripts.

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
    - run: kotlinc myProgram.kt -include-runtime -d /tmp/hello.jar; java -jar /tmp/hello.jar
    - run: kotlin myScript.main.kts
```
