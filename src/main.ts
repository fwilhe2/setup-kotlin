import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    let version = core.getInput('version')
    if (!version) {
      version = fs.readFileSync('latest_known_version.txt').toString()
    }

    let cachedPath = tc.find('kotlin', version)
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/v${version}/kotlin-compiler-${version}.zip`
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
