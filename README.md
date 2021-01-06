# Setup the [Kotlin™](https://kotlinlang.org/) cli compiler in GitHub Actions

This action downloads the Kotlin™ compiler and installs it to the path.
It won't touch the installed JREs.

By default, the latest released version of Kotlin is installed.
This can be overriden via the `version` flag.

It allows you to use the `kotlinc` and the `kotlin` tool to compile source code and run scripts.

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

## Disclaimer

This software is not affiliated with or endorsed by the owner of the [Kotlin trademark](https://kotlinlang.org/foundation/guidelines.html).
The name is used to describe what this software does.

## License

This software is released under the MIT License (MIT), see [LICENSE](./LICENSE) for details.
