import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

const IS_WINDOWS = process.platform === 'win32'
const IS_DARWIN = process.platform === 'darwin'

async function run(): Promise<void> {
  try {
    const version = getKotlinVersion(core.getInput('version'))

    let cachedPath = tc.find('kotlin', version)
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-compiler-${version}.zip`.replace('\n', '')
      )
      const ktPathExtractedFolder = await tc.extractZip(ktPath)

      cachedPath = await tc.cacheDir(ktPathExtractedFolder, 'kotlin', version)
    }

    core.addPath(`${cachedPath}/kotlinc/bin`)
    await exec.exec('kotlinc', ['-version'])

    const script = core.getInput('script')
    if (script) {
      fs.writeFileSync('script.main.kts', script)
      exec.exec('kotlin', ['script.main.kts'])
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

export function getKotlinVersion(version: string): string {
  if (version !== '') {
    return validateVersion(version)
  }

  let directoryOfLatestVersionFile = pathOfLatestVersionFile()

  if (fs.existsSync(directoryOfLatestVersionFile)) {
    const elementsInDirectory = fs.readdirSync(directoryOfLatestVersionFile)
    core.debug(`len ${elementsInDirectory.length}`)
    if (elementsInDirectory.length !== 1) {
      core.debug(
        `${directoryOfLatestVersionFile} has ${elementsInDirectory.length} items, expected one. Assuming ${elementsInDirectory[0]} is correct.`
      )
    }
    directoryOfLatestVersionFile += elementsInDirectory[0]

    core.debug(directoryOfLatestVersionFile.toString())

    const filePath = `${directoryOfLatestVersionFile}/latest_known_version.txt`
    if (fs.existsSync(filePath)) {
      version = fs.readFileSync(`${directoryOfLatestVersionFile}/latest_known_version.txt`).toString().trim()
    }
  }

  return validateVersion(normalizeVersionNumber(version))
}

export function validateVersion(version: string): string {
  //todo validate
  return version
}

export function normalizeVersionNumber(version: string): string {
  if (!version) {
    version = '1.4.0'
    core.warning('Could not determine Kotlin version to use. This should not happen because a default version should be usable.')
  }

  if (!version.startsWith('v')) {
    return version
  }

  return version.substring(1)
}

export function pathOfLatestVersionFile(): fs.PathLike {
  if (IS_WINDOWS) {
    return 'D:/a/_actions/fwilhe2/setup-kotlin/'
  } else if (IS_DARWIN) {
    return '/Users/runner/work/_actions/fwilhe2/setup-kotlin/'
  } else {
    return '/home/runner/work/_actions/fwilhe2/setup-kotlin/'
  }
}
