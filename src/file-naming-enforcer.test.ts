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
    fileService.removeFolder(/mocks-/)
  })

  it('when type is missing then we display an error message and kill a process', async () => {
    await fileNamingEnforcer.validate('folder=./mocks')

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Uuu, `type` argument is missing')
  })

  it('when a project convention is kebabCase and all files are correct then we display a success message', async () => {
    const folderName = 'mocks-1'
    await fileService.createFile(folderName, 'file-one.js')
    await fileService.createFile(folderName, 'file-two.js')
    await fileService.createFile(folderName, 'SIMPLE-READ.md')

    await fileNamingEnforcer.validate(
      `type=kebabCase folder=./${folderName} ignore=[SIMPLE-READ.md]`
    )

    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('by default ignore some files and allow to ignore other', async () => {
    const folderName = 'mocks-2'
    await fileService.createFile(folderName, 'README.md')
    await fileService.createFile(folderName, 'Dockerfile')
    await fileService.createFile(folderName, 'setupProxy.js')
    await fileService.createFile(folderName, 'SIMPLE-READ.md')

    await fileNamingEnforcer.validate(
      `type=kebabCase folder=./${folderName} ignore=[SIMPLE-READ.md]`
    )

    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('when a project convention is kebabCase and some files are wrong then we display an error message and kill a process', async () => {
    const folderName = 'mocks-3'
    await fileService.createFile(folderName, 'SIMPLE-READ.md')

    await fileNamingEnforcer.validate(`type=kebabCase folder=./${folderName}`)

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, some files are not following your project naming convention (kebabCase). Please take a look on below files: ${folderName}/SIMPLE-READ.md`
    )
  })

  it('when a project convention is capitalize and some files are wrong then we display an error message and kill a process', async () => {
    const folderName = 'mocks-4'
    await fileService.createFile(folderName, 'SIMPLE-READ.md')
    await fileService.createFile(folderName, 'simple-js-file.js')
    await fileService.createFile(folderName, 'some-scss-file.sass')

    await fileNamingEnforcer.validate(`folder=./${folderName} type=capitalize`)

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, some files are not following your project naming convention (capitalize). Please take a look on below files: ${folderName}/SIMPLE-READ.md, ${folderName}/simple-js-file.js, ${folderName}/some-scss-file.sass`
    )
  })

  it('when a project convention is not supported then we display an error message and kill a process', async () => {
    await fileNamingEnforcer.validate('folder=./mocks type=newCase')

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      'Uuu, we do not support newCase type. We only support camelCase, kebabCase, lowerCase, snakeCase, startCase, upperCase, capitalize.'
    )
  })

  it('when a folder is empty then we display a error message and kill a process', async () => {
    const folderName = 'mocks-5'
    await fileService.createFolder(folderName)
    await fileNamingEnforcer.validate(`type=kebabCase folder=./${folderName}`)

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, folder ./${folderName} is empty, please take a look on that`
    )
  })

  it('when a folder does not exist we display a error message and kill a process', async () => {
    await fileNamingEnforcer.validate('type=kebabCase folder=./xxx')

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      'Uuu, folder ./xxx does not exist, please take a look on that'
    )
  })

  it('when we could not find any file with provided extension', async () => {
    const folderName = 'mocks-6'
    await fileService.createFile(folderName, 'SIMPLE-READ.md')
    await fileService.createFile(folderName, 'simple-js-file.js')

    await fileNamingEnforcer.validate(
      `type=kebabCase folder=./${folderName} ext=tsx`
    )

    expect(processService.killProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, in folder ./${folderName} we could not find any file with .tsx extension`
    )
  })

  it('when searched files are correct then we display a success message', async () => {
    const folderName = 'mocks-7'
    await fileService.createFile(folderName, 'simple-styles.sass')
    await fileService.createFile(folderName, 'other-styles.sass')

    await fileNamingEnforcer.validate(
      `type=kebabCase folder=./${folderName} ext=sass`
    )

    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })
})
