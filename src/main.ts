import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

const IS_WINDOWS = process.platform === 'win32'
const IS_DARWIN = process.platform === 'darwin'

async function run(): Promise<void> {
  try {
    const version = core.getInput('version', {required: true})
    if (version.length === 0) {
      core.setFailed('No Kotlin version provided. This should not happen because a default version is provided.')
    }

    let cachedPath = tc.find('kotlin', version)
    let nativeCachedPath
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-compiler-${version}.zip`.replace('\n', '')
      )
      const ktPathExtractedFolder = await tc.extractZip(ktPath)

      cachedPath = await tc.cacheDir(ktPathExtractedFolder, 'kotlin', version)

      const ktNativePath = await tc.downloadTool(nativeDownloadUrl(version))
      const ktNativePathExtractedFolder = await extractNativeArchive(ktNativePath)
      nativeCachedPath = await tc.cacheDir(ktNativePathExtractedFolder, 'kotlin-native', version)
    }

    if (IS_WINDOWS) {
      core.addPath(`${nativeCachedPath}/kotlin-native-windows-${version}/bin/`)
    } else if (IS_DARWIN) {
      core.addPath(`${nativeCachedPath}/kotlin-native-macos-${version}/bin/`)
    } else {
      core.addPath(`${nativeCachedPath}/kotlin-native-linux-${version}/bin/`)
    }

    await exec.exec('kotlinc', ['-version'])
    await exec.exec('kotlinc-native', ['-version'])

    core.addPath(`${cachedPath}/kotlinc/bin`)
    await exec.exec('kotlinc', ['-version'])

    const script = core.getInput('script')
    if (script) {
      fs.writeFileSync('script.main.kts', script)
      const exitCode = await exec.exec('kotlin', ['script.main.kts'])
      if (exitCode !== 0) {
        core.setFailed('Failed to run script')
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

function nativeDownloadUrl(version: string): string {
  if (IS_WINDOWS) {
    return `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-native-windows-${version}.zip`
  } else if (IS_DARWIN) {
    return `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-native-macos-${version}.tar.gz`
  } else {
    return `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-native-linux-${version}.tar.gz`
  }
}

async function extractNativeArchive(ktNativePath: string): Promise<string> {
  if (IS_WINDOWS) {
    return tc.extractZip(ktNativePath)
  } else {
    return tc.extractTar(ktNativePath)
  }
}

run()
