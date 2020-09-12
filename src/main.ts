import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import { env } from 'process'

async function run(): Promise<void> {
  try {

    let version = core.getInput('version')
    if (!version) {
      let path = ''
      if (process.platform === 'win32') {
          path = 'D:/a/_actions/fwilhe2/setup-kotlin/Update-latest-kotlin-version/'
      } else if (process.platform === 'darwin') {
          path = '/Users/runner/work/_actions/fwilhe2/setup-kotlin/Update-latest-kotlin-version/'
      } else {
        path = '/home/runner/work/_actions/fwilhe2/setup-kotlin/Update-latest-kotlin-version/'
      }


      fs.readdirSync(path).forEach(file => {
        core.debug(file);
      });

      version = fs.readFileSync(`${path}latest_known_version.txt`).toString().trim()
    }

    let cachedPath = tc.find('kotlin', version)
    if (!cachedPath) {
      core.debug(`Could not find Kotlin ${version} in cache, downloading it.`)
      const ktPath = await tc.downloadTool(
        `https://github.com/JetBrains/kotlin/releases/download/${version}/kotlin-compiler-${version.substring(1)}.zip`.replace('\n', '')
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
