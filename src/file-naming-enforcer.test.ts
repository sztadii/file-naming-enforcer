import FileNamingEnforcer from './file-naming-enforcer'
import { FileService, ProcessService, Logger } from './services'

describe('fileNamingEnforcer function', () => {
  const processService = new ProcessService()
  const fileService = new FileService()
  const logger = new Logger()
  const fileNamingEnforcer = new FileNamingEnforcer(
    processService,
    fileService,
    logger
  )

  beforeAll(() => {
    jest.spyOn(processService, 'killProcess').mockImplementation()
    jest.spyOn(logger, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    fileService.removeFolder(/mocks-/)
  })

  it('display a success message when searched files are correct', async () => {
    const folderName = 'mocks-7'
    await fileService.createFiles(folderName, [
      'simple-styles.sass',
      'other-styles.sass'
    ])

    await fileNamingEnforcer.enforce(
      `type=kebabCase folder=./${folderName} ext=sass`
    )

    expect(processService.killProcess).not.toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('display a success message when a project convention is kebabCase and all files are correct', async () => {
    const folderName = 'mocks-1'
    await fileService.createFiles(folderName, [
      'file-one.js',
      'file-two.js',
      'SIMPLE-READ.md'
    ])

    await fileNamingEnforcer.enforce(
      `type=kebabCase folder=./${folderName} ignore=[SIMPLE-READ.md]`
    )

    expect(processService.killProcess).not.toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('display an error message and kill the process when type is missing', async () => {
    await fileNamingEnforcer.enforce('folder=./mocks')

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Uuu, `type` argument is missing')
  })

  it('by default ignore some files and allow to ignore others', async () => {
    const folderName = 'mocks-2'
    await fileService.createFiles(folderName, [
      'README.md',
      'Dockerfile',
      'setupProxy.js',
      'SIMPLE-READ.md'
    ])

    await fileNamingEnforcer.enforce(
      `type=kebabCase folder=./${folderName} ignore=[SIMPLE-READ.md]`
    )

    expect(processService.killProcess).not.toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('display an error message and kill the process when a project convention is kebabCase and some files are wrong', async () => {
    const folderName = 'mocks-3'
    await fileService.createFile(folderName, 'SIMPLE-READ.md')

    await fileNamingEnforcer.enforce(`type=kebabCase folder=./${folderName}`)

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, some files are not following your project naming convention (kebabCase). Please take a look on below files: ${folderName}/SIMPLE-READ.md`
    )
  })

  it('display an error message and kill the process when a project convention is capitalize and some files are wrong', async () => {
    const folderName = 'mocks-4'
    await fileService.createFiles(folderName, [
      'SIMPLE-READ.md',
      'simple-js-file.js',
      'some-scss-file.sass'
    ])

    await fileNamingEnforcer.enforce(`folder=./${folderName} type=capitalize`)

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, some files are not following your project naming convention (capitalize). Please take a look on below files: ${folderName}/SIMPLE-READ.md, ${folderName}/simple-js-file.js, ${folderName}/some-scss-file.sass`
    )
  })

  it('display an error message and kill the process when the project convention is not supported', async () => {
    await fileNamingEnforcer.enforce('folder=./mocks type=newCase')

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      'Uuu, we do not support newCase type. We only support camelCase, kebabCase, lowerCase, snakeCase, startCase, upperCase, capitalize.'
    )
  })

  it('display an error message and kill the process when the folder is empty', async () => {
    const folderName = 'mocks-5'
    await fileService.createFolder(folderName)
    await fileNamingEnforcer.enforce(`type=kebabCase folder=./${folderName}`)

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, folder ./${folderName} is empty, please take a look on that`
    )
  })

  it('display an error message and kill the process when the folder does not exist', async () => {
    await fileNamingEnforcer.enforce('type=kebabCase folder=./xxx')

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      'Uuu, folder ./xxx does not exist, please take a look on that'
    )
  })

  it('display an error message and kill the process when no files with the provided extension are found', async () => {
    const folderName = 'mocks-6'
    await fileService.createFiles(folderName, [
      'SIMPLE-READ.md',
      'simple-js-file.js'
    ])

    await fileNamingEnforcer.enforce(
      `type=kebabCase folder=./${folderName} ext=tsx`
    )

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, in folder ./${folderName} we could not find any file with .tsx extension`
    )
  })
})
