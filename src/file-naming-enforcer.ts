import * as lodash from 'lodash'
import { ProcessService, FileService, Logger } from './services'

export default class FileNamingEnforcer {
  constructor(
    private processService: ProcessService,
    private fileService: FileService,
    private logger: Logger
  ) {}

  public async validate(processArgs: string) {
    try {
      const message = await this.validateArgs(processArgs)
      this.logger.log(message)
    } catch (e) {
      this.logger.log(e.message)
      this.processService.failProcess()
    }
  }

  private async validateArgs(processArgs: string) {
    const processArguments = this.processService.getArguments<
      ProcessRequestedArguments
    >(processArgs, ['folder', 'ext', 'type', 'ignore'])

    const { folder = './', ext = '*', type, ignore = [] } = processArguments

    if (!type) {
      throw new Error('Uuu, `type` argument is missing')
    }

    const validateFunctions = {
      camelCase: lodash.camelCase,
      kebabCase: lodash.kebabCase,
      lowerCase: lodash.lowerCase,
      snakeCase: lodash.snakeCase,
      startCase: lodash.startCase,
      upperCase: lodash.upperCase,
      capitalize: lodash.capitalize
    }

    const validateFunction = validateFunctions[type]

    if (!validateFunction) {
      const supportedTypes = Object.keys(validateFunctions).join(', ')
      throw new Error(
        `Uuu, we do not support ${type} type. We only support ${supportedTypes}.`
      )
    }

    let files: string[] = []

    try {
      files = await this.fileService.getFiles(folder, ext)
    } catch (e) {
      throw new Error(
        `Uuu, folder ${folder} is empty, please take a look on that`
      )
    }

    if (!files.length) {
      throw new Error(
        `Uuu, in folder ${folder} we could not find any file with .${ext} extension`
      )
    }

    const ignores = [...DEFAULT_IGNORED_FILES, ...ignore]

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
      const messageBase = `Uuu, some files are not following your project naming convention (${type}). Please take a look on below files: `
      const pathsText = paths.join(', ')
      throw new Error(messageBase + pathsText)
    }

    return 'Great, everything looks fine :)'
  }
}

interface ProcessRequestedArguments {
  folder: string
  ext: string
  type: string
  ignore: string[]
}

const DEFAULT_IGNORED_FILES = [
  'node_modules',
  '.git',
  'idea',
  'index',
  'README',
  'Dockerfile',
  'setupProxy',
  '.DS_Store'
]
