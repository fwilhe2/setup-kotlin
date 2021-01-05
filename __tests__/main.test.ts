import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

const toolDir = path.join(__dirname, 'runner', 'tools')
const tempDir = path.join(__dirname, 'runner', 'temp')

process.env['RUNNER_TOOL_CACHE'] = toolDir
process.env['RUNNER_TEMP'] = tempDir

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs with explicit version', () => {
  process.env['INPUT_SCRIPT'] = 'println(234234)'
  process.env['INPUT_VERSION'] = '1.4.21'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  const output = cp.execSync(`node ${ip}`, options).toString()
  expect(output).toMatch(/kotlinc-jvm 1.4.21/)
})
