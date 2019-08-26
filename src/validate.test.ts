import * as mockProcess from 'jest-mock-process'
import { validate } from './validate'

const oldArgs = process.argv

function mockArgv(args: string[]) {
  process.argv = [...oldArgs, ...args]
}

test('validate function just call console.log', async () => {
  const args = ['type=kebabCase', 'path=./', 'ignore=[./README.md, ./node_modules]']
  mockArgv(args)

  const mockExit = mockProcess.mockConsoleLog()

  await validate()
  expect(mockExit).toHaveBeenCalled()
})
