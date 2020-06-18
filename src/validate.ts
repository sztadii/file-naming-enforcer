import * as find from 'find'
import * as lodash from 'lodash'

const defaultIgnores = [
  'node_modules',
  '.git',
  'idea',
  'index',
  'README',
  'Dockerfile',
  'setupProxy'
]

export async function validate(): Promise<void> {
  const { folder = './', ext = '*', type = 'kebabCase', ignore = [] } = getSettings()
  const validateFunction = lodash[type.toString()]

  if (!validateFunction) {
    exitProcessWithMessage(`Uuu, we do not support ${type}`)
    return
  }

  let files = []

  try {
    files = await getFiles(folder.toString(), ext.toString())
  } catch (e) {
    exitProcessWithMessage(`Uuu, folder ${folder} is empty, please take a look on that`)
  }

  if (!files.length) {
    exitProcessWithMessage(
      `Uuu, in folder ${folder} we could not find any file with .${ext} extension`
    )
  }

  const ignores = [...defaultIgnores, ...ignore]

  const elementsToCompare = files
    .filter(file => !ignores.find(ignore => file.includes(ignore)))
    .map(file => {
      return {
        originalPath: file,
        toCompare: file.replace(/\./g, '').split('/')
      }
    })

  const elementsWithWrongValues = elementsToCompare.filter(e =>
    e.toCompare.find(e => validateFunction(e) !== e)
  )

  if (!elementsWithWrongValues.length) {
    console.log('Great, everything looks fine :)')
  } else {
    const paths = elementsWithWrongValues.map(e => e.originalPath)
    exitProcessWithMessage(
      `Uuu, some files are not following your project naming convention (${type}). Please take a look on below files`,
      paths
    )
  }
}

function exitProcessWithMessage(...message): void {
  console.log(...message)
  process.exit(1)
}

function getFiles(folder: string, ext: string): Promise<string[]> {
  return new Promise((resolve, reject) =>
    find.file(new RegExp(`\\.${ext}$`), folder, resolve).error(reject)
  )
}

export function getSettings() {
  const type = process.argv.find(e => e.includes('type'))
  const folder = process.argv.find(e => e.includes('folder'))
  const ext = process.argv.find(e => e.includes('ext'))
  const ignore = process.argv.find(e => e.includes('ignore'))

  return {
    ...parseToObject(type),
    ...parseToObject(folder),
    ...parseToObject(ext),
    ...parseToObject(ignore)
  }
}

function parseToObject(args: string) {
  if (!args) return {}
  const [key, val] = args.split('=')
  return {
    [key]: val.includes('[') ? parseToArray(val) : val
  }
}

function parseToArray(text: string): string[] {
  return text
    .replace('[', '')
    .replace(']', '')
    .split(',')
}
