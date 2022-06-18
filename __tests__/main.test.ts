import {getInputInstallNative} from '../src/main'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

const toolDir = path.join(__dirname, 'runner', 'tools')
const tempDir = path.join(__dirname, 'runner', 'temp')

process.env['RUNNER_TOOL_CACHE'] = toolDir
process.env['RUNNER_TEMP'] = tempDir

test('getInputInstallNative string true', async () => {
  expect(getInputInstallNative('true')).toStrictEqual(true)
})

test('getInputInstallNative string false', async () => {
  expect(getInputInstallNative('false')).toStrictEqual(false)
})

test('getInputInstallNative string empty', async () => {
  expect(getInputInstallNative('')).toStrictEqual(true)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs with explicit version', () => {
  process.env['INPUT_SCRIPT'] = 'println(234234)'
  process.env['INPUT_VERSION'] = '1.7.0'
  process.env['INPUT_install-native'] = 'false'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  const output = cp.execSync(`node ${ip}`, options).toString()
  expect(output).toMatch(/kotlinc-jvm 1.7.0/)
})
