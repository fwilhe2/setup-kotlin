import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as tc from '@actions/tool-cache'
import * as os from 'os'

const IS_WINDOWS = process.platform === 'win32'
const IS_DARWIN = process.platform === 'darwin'

async function run(): Promise<void> {
  try {
    const version = core.getInput('version', {required: true})
    if (version.length === 0) {
      core.setFailed('No Kotlin version provided. This should not happen because a default version is provided.')
    }

    const installNative = getInputInstallNative(core.getInput('install-native'))

    let cachedPath = tc.find('kotlin', version)
    let nativeCachedPath = tc.find('kotlin-native', version)
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-compiler-${version}.zip`.replace('\n', '')
      )
      core.debug(`Downloaded Kotlin ${version} to ${ktPath}`)

      const ktPathExtractedFolder = await tc.extractZip(ktPath)

      cachedPath = await tc.cacheDir(ktPathExtractedFolder, 'kotlin', version)

      if (!nativeCachedPath) {
        if (installNative) {
          const ktNativePath = await tc.downloadTool(nativeDownloadUrl(version))
          core.debug(`Downloaded Kotlin Native ${version} to ${ktNativePath}`)
          core.exportVariable('KOTLIN_NATIVE_HOME', ktNativePath)

          const ktNativePathExtractedFolder = await extractNativeArchive(ktNativePath)
          nativeCachedPath = await tc.cacheDir(ktNativePathExtractedFolder, 'kotlin-native', version)
        }
      }
    }

    /*
    The order of addPath call here matter because both archives have a "kotlinc" binary.
    */
    if (installNative) {
      const nativePath = `${nativeCachedPath}/kotlin-native-prebuilt-${osName()}-${osArch()}-${version}`
      core.addPath(`${nativePath}/bin`)
      core.exportVariable('KOTLIN_NATIVE_HOME', nativePath)
      core.debug(`Added ${nativePath}/bin to PATH`)
      await exec.exec('kotlinc-native', ['-version'])
    }

    const kotlinPath = `${cachedPath}/kotlinc`
    core.addPath(`${kotlinPath}/bin`)
    core.exportVariable('KOTLIN_HOME', kotlinPath)
    core.debug(`Added ${kotlinPath}/bin to PATH`)
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
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export function getInputInstallNative(skipNative: string): boolean {
  return (skipNative || 'true').toLowerCase() === 'true'
}

function nativeDownloadUrl(version: string): string {
  const fileEnding = IS_WINDOWS ? 'zip' : 'tar.gz'
  return `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-native-prebuilt-${osName()}-${osArch()}-${version}.${fileEnding}`
}

function osName(): string {
  if (IS_WINDOWS) {
    return 'windows'
  } else if (IS_DARWIN) {
    return 'macos'
  } else {
    return 'linux'
  }
}

function osArch(): string {
  switch (os.arch()) {
    case 'arm':
    case 'arm64':
      return 'aarch64'
  }

  return 'x86_64'
}

async function extractNativeArchive(ktNativePath: string): Promise<string> {
  if (IS_WINDOWS) {
    return tc.extractZip(ktNativePath)
  } else {
    return tc.extractTar(ktNativePath)
  }
}

run()
