# Setup the [Kotlin™](https://kotlinlang.org/) cli compiler in GitHub Actions

![build-test](https://github.com/fwilhe2/setup-kotlin/workflows/build-test/badge.svg)
![license](https://img.shields.io/github/license/fwilhe2/setup-kotlin)
![latest-version](https://img.shields.io/github/v/tag/fwilhe2/setup-kotlin)

This action downloads the Kotlin™ compiler and installs it to the path.
It won't touch the installed JREs.

By default, the latest released version of Kotlin is installed.
This can be overriden via the `version` flag.

It allows you to use the `kotlinc` and the `kotlin` tool to compile source code and run scripts.

> :warning: **Note:** You probably don't need this action.
> GitHub now pre-installs Kotlin, if this works for you, there is no need to use this action.
> See [this issue](https://github.com/fwilhe2/setup-kotlin/issues/174) for more details.
> Furthermore, you don't need this action if you want to build a Kotlin project using Maven/Gradle as they will download the compiler for you.
> This action is useful if you need or want to use the `kotlin`/`kotlinc`/`kotlinc-native` cli tools, if you want to install a specific version of them or if you run workflows in a container/runner where Kotlin is not preinstalled.

See [this repo](https://github.com/fwilhe2/improved-enigma) for usage examples.

## Usage example

```yaml
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

### Kotlin/Native

You can also build os-native binaries using `kotlinc-native` as in this example:

```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ ubuntu-20.04, windows-latest, macos-latest ]
    steps:
      - uses: actions/checkout@v2
      - uses: fwilhe2/setup-kotlin@main
        with:
          install-native: true
      - run: kotlinc-native foo.kt
      - run: ./program.exe
        if: ${{ matrix.os == 'windows-latest' }}
      - run: ./program.kexe
        if: ${{ matrix.os != 'windows-latest' }}
```

## Running a script inline

If you provide a string-argument `script`, the action will execute it via [`kotlin-main-kts` script definition jar](https://github.com/Kotlin/kotlin-script-examples/blob/master/jvm/main-kts/MainKts.md), see this example:

```yaml
    - uses: fwilhe2/setup-kotlin@main
      with:
        script: |
            #!/usr/bin/env kotlin
            //more kotlin script code here
```

### Using `kotlin` as a shell

 Starting with version [`1.4.30`](https://github.com/JetBrains/kotlin/releases/tag/v1.4.30), you can configure `kotlin` as a shell in Actions like in this example:
```yaml
      - uses: fwilhe2/setup-kotlin@main
        with:
          version: 1.7.0

      - run: |
            java.io.File(".").listFiles().forEach {it -> println(it.getName().toString())}
        shell: kotlin -howtorun .main.kts {0}
```

See https://youtrack.jetbrains.com/issue/KT-43534 and https://github.com/actions/runner/issues/813 for more details.

## Disclaimer

This software is not affiliated with or endorsed by the owner of the [Kotlin trademark](https://kotlinlang.org/foundation/guidelines.html).
The name is used to describe what this software does.

## License

This software is released under the MIT License (MIT), see [LICENSE](./LICENSE) for details.
