import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    let version = core.getInput('version')
    core.debug(version)
    if (!version) {
      version = fs.readFileSync('/home/runner/work/_actions/fwilhe2/setup-kotlin/Update-latest-kotlin-version/latest_known_version.txt').toString()
      core.debug(version)
    }

    let cachedPath = tc.find('kotlin', version)
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/${version.trim()}/kotlin-compiler-${version.trim().substring(1)}.zip`
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
