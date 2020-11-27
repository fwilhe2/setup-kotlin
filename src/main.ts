import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as fs from 'fs'

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

      const ktNativePath = await tc.downloadTool(`https://github.com/JetBrains/kotlin/releases/download/v1.4.20/kotlin-native-linux-1.4.20.tar.gz`)
      const ktNativePathExtractedFolder = await tc.extractZip(ktNativePath)
      nativeCachedPath = await tc.cacheDir(ktNativePathExtractedFolder, 'kotlin-native', version)

    }

    core.addPath(`${cachedPath}/kotlinc/bin`)
    await exec.exec('kotlinc', ['-version'])

    core.addPath(`${nativeCachedPath}/kotlin-native-linux-1.4.20/bin/`)
    await exec.exec('kotlinc', ['-version'])
    await exec.exec('kotlinc-native', ['-version'])



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

run()
