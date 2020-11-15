import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

const toolDir = path.join(__dirname, 'runner', 'tools')
const tempDir = path.join(__dirname, 'runner', 'temp')

process.env['RUNNER_TOOL_CACHE'] = toolDir
process.env['RUNNER_TEMP'] = tempDir

// shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   process.env['INPUT_SCRIPT'] = 'println(234234)'
//   const ip = path.join(__dirname, '..', 'lib', 'main.js')
//   const options: cp.ExecSyncOptions = {
//     env: process.env
//   }
//   const output = cp.execSync(`node ${ip}`, options).toString().split('\n')
//   console.log(output)
//   console.log(output[output.length - 2])
//   expect(output[output.length - 2]).toEqual('234234')
// })

test('test runs with explicit version', () => {
  process.env['INPUT_SCRIPT'] = 'println(234234)'
  process.env['INPUT_VERSION'] = '1.3.72'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  const output = cp.execSync(`node ${ip}`, options).toString()
  expect(output).toMatch(/kotlinc-jvm 1.3.72/)
})
