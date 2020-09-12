import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

function pathOfLatestVersionFile(): fs.PathLike {
  if (process.platform === 'win32') {
    return 'D:/a/_actions/fwilhe2/setup-kotlin/'
  } else if (process.platform === 'darwin') {
    return '/Users/runner/work/_actions/fwilhe2/setup-kotlin/'
  } else {
    return '/home/runner/work/_actions/fwilhe2/setup-kotlin/'
  }
}

async function run(): Promise<void> {
  try {
    let version = core.getInput('version')
    if (!version) {
      let path = pathOfLatestVersionFile()

      const x = fs.readdirSync(path)
      core.debug(`len ${x.length}`)
      if (x.length !== 1) {
        core.debug(
          `${x} has ${x.length} items, expected one. Assuming ${x[0]} is correct.`
        )
      }
      path += x[0]

      core.debug(path.toString())

      if (fs.existsSync(path)) {
        const filePath = `${path}/latest_known_version.txt`
        if (fs.existsSync(filePath)) {
          version = fs
            .readFileSync(`${path}/latest_known_version.txt`)
            .toString()
            .trim()
        }
      }
    }
    if (!version) {
      version = 'v1.4.0'
    }

    let cachedPath = tc.find('kotlin', version)
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/${version}/kotlin-compiler-${version.substring(
          1
        )}.zip`.replace('\n', '')
      )
      const ktPathExtractedFolder = await tc.extractZip(ktPath)

      cachedPath = await tc.cacheDir(ktPathExtractedFolder, 'kotlin', version)
    }

    core.addPath(`${cachedPath}/kotlinc/bin`)
    exec.exec('kotlinc', ['-version'])

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
