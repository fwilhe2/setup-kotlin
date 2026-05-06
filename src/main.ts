import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as tc from '@actions/tool-cache'
import * as os from 'os'
import * as path from 'path'

const IS_WINDOWS = process.platform === 'win32'
const IS_DARWIN = process.platform === 'darwin'

export async function run(): Promise<void> {
  try {
    const version = getRequiredVersion()
    const installNative = shouldInstallNative(core.getInput('install-native'))

    const kotlinHome = await setupKotlin(version)
    core.exportVariable('KOTLIN_HOME', kotlinHome)
    core.addPath(path.join(kotlinHome, 'bin'))

    await exec.exec('kotlinc', ['-version'])

    if (installNative) {
      const nativeHome = await setupKotlinNative(version)
      core.exportVariable('KOTLIN_NATIVE_HOME', nativeHome)
      core.addPath(path.join(nativeHome, 'bin'))

      await exec.exec('kotlinc-native', ['-version'])
    }

    await maybeRunScript()

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error occurred')
    }
  }
}

async function setupKotlin(version: string): Promise<string> {
  let cachedPath = tc.find('kotlin', version)

  if (!cachedPath) {
    core.info(`Downloading Kotlin ${version}...`)

    const url = `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-compiler-${version}.zip`

    const archive = await safeDownload(url)
    const extracted = await tc.extractZip(archive)

    cachedPath = await tc.cacheDir(extracted, 'kotlin', version)
  } else {
    core.info(`Using cached Kotlin ${version}`)
  }

  const kotlinHome = resolveSubdir(cachedPath, 'kotlinc')

  return kotlinHome
}

async function setupKotlinNative(version: string): Promise<string> {
  let cachedPath = tc.find('kotlin-native', version)

  if (!cachedPath) {
    core.info(`Downloading Kotlin Native ${version}...`)

    const url = nativeDownloadUrl(version)
    const archive = await safeDownload(url)
    const extracted = await extractNativeArchive(archive)

    cachedPath = await tc.cacheDir(extracted, 'kotlin-native', version)
  } else {
    core.info(`Using cached Kotlin Native ${version}`)
  }

  const expectedDirName = `kotlin-native-prebuilt-${osName()}-${osArch()}-${version}`
  const nativeHome = resolveSubdir(cachedPath, expectedDirName)

  return nativeHome
}

async function maybeRunScript(): Promise<void> {
  const script = core.getInput('script')
  if (!script) return

  const scriptPath = 'script.main.kts'

  if (fs.existsSync(scriptPath)) {
    core.warning(`${scriptPath} already exists and will be overwritten`)
  }

  fs.writeFileSync(scriptPath, script)

  const exitCode = await exec.exec('kotlin', [scriptPath])
  if (exitCode !== 0) {
    throw new Error('Failed to run Kotlin script')
  }
}

function getRequiredVersion(): string {
  const version = core.getInput('version', { required: true }).trim()

  if (!version) {
    throw new Error('Kotlin version is required')
  }

  if (!/^\d+\.\d+(\.\d+)?(-.+)?$/.test(version)) {
    core.warning(`Version "${version}" does not match typical Kotlin version format`)
  }

  return version
}

function shouldInstallNative(input: string): boolean {
  return input.trim().toLowerCase() === 'true'
}

function nativeDownloadUrl(version: string): string {
  const ext = IS_WINDOWS ? 'zip' : 'tar.gz'
  return `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-native-prebuilt-${osName()}-${osArch()}-${version}.${ext}`
}

function osName(): string {
  if (IS_WINDOWS) return 'windows'
  if (IS_DARWIN) return 'macos'
  return 'linux'
}

function osArch(): string {
  switch (os.arch()) {
    case 'arm':
    case 'arm64':
      return 'aarch64'
    default:
      return 'x86_64'
  }
}

async function extractNativeArchive(file: string): Promise<string> {
  return IS_WINDOWS ? tc.extractZip(file) : tc.extractTar(file)
}

async function safeDownload(url: string): Promise<string> {
  try {
    return await tc.downloadTool(url)
  } catch (err) {
    throw new Error(`Failed to download: ${url}`)
  }
}

/**
 * Resolves a subdirectory safely.
 * Falls back to first directory if exact match not found.
 */
function resolveSubdir(base: string, expected: string): string {
  const fullPath = path.join(base, expected)

  if (fs.existsSync(fullPath)) {
    return fullPath
  }

  const entries = fs.readdirSync(base)
  const dirs = entries.filter(e => fs.statSync(path.join(base, e)).isDirectory())

  if (dirs.length === 1) {
    return path.join(base, dirs[0])
  }

  throw new Error(
    `Could not find expected directory "${expected}" in ${base}`
  )
}

run()
