import {getInputInstallNative} from '../src/main'
import * as process from 'process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

const toolDir = path.join('runner', 'tools')
const tempDir = path.join('runner', 'temp')

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
