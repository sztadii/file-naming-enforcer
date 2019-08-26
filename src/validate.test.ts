import * as mockProcess from 'jest-mock-process'
import { validate, getSettings } from './validate'

const oldArgs = process.argv

function mockArgv(args: string[]) {
  process.argv = [...oldArgs, ...args]
}

beforeEach(() => {
  process.argv = oldArgs
})

test('When a project convention is kebabCase and all files are correct then we display a success message', async () => {
  const args = ['folder=./mocks', 'ignore=[README.md, Dockerfile]']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()

  await validate()
  expect(mockLog).toHaveBeenCalledWith('Great, everything looks fine :)')
})

test('When a project convention is kebabCase and some files are wrong then we display an error message and kill a process', async () => {
  const args = ['folder=./mocks']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith(
    'Uuu, some files are wrong. Please take a look on below files',
    ['mocks/README.md']
  )
})

test('When a project convention is capitalize and some files are wrong then we display an error message and kill a process', async () => {
  const args = ['folder=./mocks', 'type=capitalize', 'ignore=[README.md]']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith(
    'Uuu, some files are wrong. Please take a look on below files',
    ['mocks/simple-js-file.js', 'mocks/some-scss-file.sass']
  )
})

test('When a project convention is not supported then we display an error message and kill a process', async () => {
  const args = ['folder=./mocks', 'type=newCase']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith('Uuu, we do not support newCase')
})

test('When a folder is empty then we display a error message and kill a process', async () => {
  const args = ['folder=./xxx']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith('Uuu, folder ./xxx is empty, please take a look on that')
})

test('When a searched files are correct then we display a success message', async () => {
  const args = ['folder=./mocks', 'ext=scss']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()

  await validate()
  expect(mockLog).toHaveBeenCalledWith('Great, everything looks fine :)')
})

test('Function getSettings without any issues extracts data from process.argv', async () => {
  const args = [
    'folder=./xxx',
    'type=camelCase',
    'ignore=[build,fonts,README.md,Dockerfile]',
    'ext=scss'
  ]
  mockArgv(args)

  const settings = getSettings()

  expect(settings).toEqual({
    folder: './xxx',
    type: 'camelCase',
    ignore: ['build', 'fonts', 'README.md', 'Dockerfile'],
    ext: 'scss'
  })
})
