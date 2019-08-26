import * as find from 'find'
import * as lodash from 'lodash'

const defaultIgnores = ['node_modules', '.git', 'idea']

export async function validate(): Promise<void> {
  const { path = './', type = 'kebabCase', ignore = [] } = getSettings()
  const validateFunction = lodash[type.toString()]

  if (!validateFunction) {
    console.log(`Uuu, we do not support ${type}`)
    process.exit(1)
    return
  }

  const files = await getFiles(path.toString())
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
    console.log('Uuu, some files are wrong. Please take a look on below files', paths)
    process.exit(1)
  }
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
    .replace(' ', '')
    .split(',')
}
