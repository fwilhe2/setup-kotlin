import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const ktPath = await tc.downloadTool(
      'https://github.com/JetBrains/kotlin/releases/download/v1.4.0/kotlin-compiler-1.4.0.zip'
    )
    const ktPathExtractedFolder = await tc.extractZip(ktPath)
    core.addPath(`${ktPathExtractedFolder}/kotlinc/bin`)
    exec.exec('kotlinc', ['-version'])

    const script = core.getInput('script')
    if (script) {
      fs.writeFileSync("script.main.kts", script)
      exec.exec('kotlin', ['script.main.kts'])
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
