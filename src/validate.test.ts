import * as mockProcess from 'jest-mock-process'
import { validate } from './validate'

const oldArgs = process.argv

function mockArgv(args: string[]) {
  process.argv = [...oldArgs, ...args]
}

beforeEach(() => {
  process.argv = oldArgs
})

test('When a project convention is kebabCase and all files are correct then we display a success message', async () => {
  const args = ['path=./', 'ignore=[README.md, Dockerfile]']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()

  await validate()
  expect(mockLog).toHaveBeenCalledWith('Great, everything looks fine :)')
})

test('When a project convention is kebabCase and some files are wrong then we display an error message and kill a process', async () => {
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith(
    'Uuu, some files are wrong. Please take a look on below files',
    ['README.md']
  )
})

test('When a project convention is camelCase and some files are wrong then we display an error message and kill a process', async () => {
  const args = ['type=camelCase', 'ignore=[README.md]']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith(
    'Uuu, some files are wrong. Please take a look on below files',
    ['package-lock.json']
  )
})

test('When a project convention is not supported then we display an error message and kill a process', async () => {
  const args = ['type=newCase']
  mockArgv(args)
  const mockLog = mockProcess.mockConsoleLog()
  const mockExit = mockProcess.mockProcessExit()

  await validate()
  expect(mockExit).toHaveBeenCalledWith(1)
  expect(mockLog).toHaveBeenCalledWith('Uuu, we do not support newCase')
})
