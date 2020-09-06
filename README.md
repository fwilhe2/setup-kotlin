# Setup the [Kotlin](https://kotlinlang.org/) cli compiler in GitHub Actions

This action downloads the Kotlin compiler and installs it to the path.
It won't touch the installed JREs.

As of now, it only supports downloading [Kotlin 1.4.0](https://github.com/JetBrains/kotlin/releases/tag/v1.4.0).

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

## Running a script inline

If you provide a string-argument `script`, the action will execute it via [`kotlin-main-kts` script definition jar](https://github.com/Kotlin/kotlin-script-examples/blob/master/jvm/main-kts/MainKts.md), see this example:

```yml
    - uses: fwilhe2/setup-kotlin@main
      with:
        script: |
            #!/usr/bin/env kotlin
            //more kotlin script code here
```

## License

This software is released under the MIT License (MIT), see [LICENSE](./LICENSE) for details.
