import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    const ktPath = await tc.downloadTool(
      'https://github.com/JetBrains/kotlin/releases/download/v1.4.0/kotlin-compiler-1.4.0.zip'
    )
    const ktPathExtractedFolder = await tc.extractZip(ktPath, 'kotlin-compiler')
    core.addPath(`${ktPathExtractedFolder}/kotlinc/bin`)
    exec.exec('kotlinc', ['-version'])
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
