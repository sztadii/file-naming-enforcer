import * as find from 'find'
import * as lodash from 'lodash'

const ignores = ['node_modules', '.git']

export async function validate(): Promise<void> {
  const { path, type } = getSettings()
  const files = await getFiles(path.toString())

  const filtered = files.filter(file => !ignores.find(ignore => file.includes(ignore)))
  const validateFunction = lodash[type.toString()]

  const withWrongTypes = filtered.filter(e => validateFunction(e) !== e)
  console.log(withWrongTypes)
}

function getFiles(path: string): Promise<string[]> {
  return new Promise(resolve => find.file(path, resolve))
}

function getSettings() {
  const type = process.argv.find(e => e.includes('type'))
  const path = process.argv.find(e => e.includes('path'))
  const ignore = process.argv.find(e => e.includes('ignore'))

  return {
    ...parseToObject(type),
    ...parseToObject(path),
    ...parseToObject(ignore)
  }
}

function parseToObject(args: string) {
  const [key, val] = args.split('=')
  return {
    [key]: val.includes('[') ? parseToArray(val) : val
  }
}

function parseToArray(text: string): string[] {
  return text
    .replace('[', '')
    .replace(']', '')
    .replace(' ', '')
    .split(',')
}
