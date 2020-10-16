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

export async function fileNamingEnforcer(): Promise<void> {
  const { folder = './', ext = '*', type, ignore = [] } = getParsedArguments()

  if (!type) {
    exitProcessWithMessage('Uuu, `type` argument is missing')
  }

  const validateFunction = lodash[type.toString()]

  if (!validateFunction) {
    exitProcessWithMessage(`Uuu, we do not support ${type}`)
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

  if (elementsWithWrongValues.length) {
    const paths = elementsWithWrongValues.map(e => e.originalPath)
    exitProcessWithMessage(
      `Uuu, some files are not following your project naming convention (${type}). Please take a look on below files`,
      paths
    )
  }

  console.log('Great, everything looks fine :)')
}

function exitProcessWithMessage(...message): void {
  console.log('------')
  console.log(...message)
  console.log('------\n')
  process.exit(1)
}

function getFiles(folder: string, ext: string): Promise<string[]> {
  return new Promise((resolve, reject) =>
    find.file(new RegExp(`\\.${ext}$`), folder, resolve).error(reject)
  )
}

export function getParsedArguments() {
  const { argv } = process
  const type = argv.find(e => e.includes('type'))
  const folder = argv.find(e => e.includes('folder'))
  const ext = argv.find(e => e.includes('ext'))
  const ignore = argv.find(e => e.includes('ignore'))

  return {
    ...parseProcessArgumentToObject(type),
    ...parseProcessArgumentToObject(folder),
    ...parseProcessArgumentToObject(ext),
    ...parseProcessArgumentToObject(ignore)
  }
}

function parseProcessArgumentToObject(processArgument: string) {
  if (!processArgument) return {}
  const [key, val] = processArgument.split('=')
  const parsedValue = val.includes('[') ? parseTextToArray(val) : val
  return {
    [key]: parsedValue
  }
}

function parseTextToArray(text: string): string[] {
  return text
    .replace('[', '')
    .replace(']', '')
    .split(',')
}
