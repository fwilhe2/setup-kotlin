import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {pathOfLatestVersionFile, getKotlinVersion, normalizeVersionNumber} from '../src/main'

const toolDir = path.join(__dirname, 'runner', 'tools')
const tempDir = path.join(__dirname, 'runner', 'temp')

process.env['RUNNER_TOOL_CACHE'] = toolDir
process.env['RUNNER_TEMP'] = tempDir
const IS_WINDOWS = process.platform === 'win32'
const IS_DARWIN = process.platform === 'darwin'

test('Ensure we get the expected checkout location on the given OS', () => {
  const path = pathOfLatestVersionFile()
  if (IS_WINDOWS) expect(path).toEqual('D:/a/_actions/fwilhe2/setup-kotlin/')
  else if (IS_DARWIN) expect(path).toEqual('/Users/runner/work/_actions/fwilhe2/setup-kotlin/')
  else expect(path).toEqual('/home/runner/work/_actions/fwilhe2/setup-kotlin/')
})

test('Version is as provided', () => {
  const actual = getKotlinVersion('1.2.3')
  expect(actual).toEqual('1.2.3')
})

test('normalizeVersionNumber', () => {
  const actual = normalizeVersionNumber('v1.2.3')
  expect(actual).toEqual('1.2.3')
})

test('Version is not provided, should return default', () => {
  const actual = getKotlinVersion('')
  //todo test behavior is different in docker image and locally due to existing latest_known_versions file
  if (!process.env['CI']) {
    expect(actual).toEqual('1.4.0')
  }
})

// todo: test with mocked filesystem

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_SCRIPT'] = 'println(234234)'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  const output = cp.execSync(`node ${ip}`, options).toString().split('\n')
  console.log(output)
  console.log(output[output.length - 2])
  expect(output[output.length - 2]).toEqual('234234')
})

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
