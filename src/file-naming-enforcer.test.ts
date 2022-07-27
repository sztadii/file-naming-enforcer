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

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(processService, 'failProcess').mockImplementation(jest.fn)
    jest.spyOn(logger, 'log').mockImplementation(jest.fn)
  })

  it('when type is missing then we display an error message and kill a process', async () => {
    await fileNamingEnforcer.validate('folder=./mocks')

    expect(processService.failProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Uuu, `type` argument is missing')
  })

  it('when a project convention is kebabCase and all files are correct then we display a success message', async () => {
    await fileNamingEnforcer.validate(
      'type=kebabCase folder=./mocks ignore=[SIMPLE-READ.md]'
    )
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('by default ignore some files and allow to ignore other', async () => {
    // Below files are part of defaultIgnores
    require('../mocks/README.md')
    require('../mocks/module/Dockerfile')
    require('../mocks/module/setupProxy.js')

    // Below file will be ignored
    require('../mocks/SIMPLE-READ.md')

    await fileNamingEnforcer.validate(
      'type=kebabCase folder=./mocks ignore=[SIMPLE-READ.md]'
    )
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })

  it('when a project convention is kebabCase and some files are wrong then we display an error message and kill a process', async () => {
    await fileNamingEnforcer.validate('type=kebabCase folder=./mocks')

    expect(processService.failProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, some files are not following your project naming convention (kebabCase). Please take a look on below files: mocks/SIMPLE-READ.md`
    )
  })

  it('when a project convention is capitalize and some files are wrong then we display an error message and kill a process', async () => {
    await fileNamingEnforcer.validate('folder=./mocks type=capitalize')

    expect(processService.failProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      `Uuu, some files are not following your project naming convention (capitalize). Please take a look on below files: mocks/SIMPLE-READ.md, mocks/simple-js-file.js, mocks/some-scss-file.sass`
    )
  })

  it('when a project convention is not supported then we display an error message and kill a process', async () => {
    await fileNamingEnforcer.validate('folder=./mocks type=newCase')

    expect(processService.failProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Uuu, we do not support newCase')
  })

  it('when a folder is empty then we display a error message and kill a process', async () => {
    await fileNamingEnforcer.validate('type=kebabCase folder=./xxx')

    expect(processService.failProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      'Uuu, folder ./xxx is empty, please take a look on that'
    )
  })

  it('when we could not find any file with provided extension', async () => {
    await fileNamingEnforcer.validate('type=kebabCase folder=./mocks ext=tsx')

    expect(processService.failProcess).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(
      'Uuu, in folder ./mocks we could not find any file with .tsx extension'
    )
  })

  it('when searched files are correct then we display a success message', async () => {
    await fileNamingEnforcer.validate('type=kebabCase folder=./mocks ext=sass')

    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith('Great, everything looks fine :)')
  })
})
