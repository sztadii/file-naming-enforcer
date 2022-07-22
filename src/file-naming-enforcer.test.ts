import FileNamingEnforcer from './file-naming-enforcer'
import { FileService, ProcessService, Logger } from './services'

describe('fileNamingEnforcer function', () => {
  const fileNamingEnforcer = new FileNamingEnforcer(
    new ProcessService(),
    new FileService(),
    new Logger()
  )

  it('when type is missing then we display an error message and kill a process', async () => {
    try {
      await fileNamingEnforcer.validate('folder=./mocks')
    } catch (e) {
      expect(e.message).toContain('Uuu, `type` argument is missing')
    }

    expect.assertions(1)
  })

  it('when a project convention is kebabCase and all files are correct then we display a success message', async () => {
    const message = await fileNamingEnforcer.validate(
      'type=kebabCase folder=./mocks ignore=[SIMPLE-READ.md]'
    )
    expect(message).toBe('Great, everything looks fine :)')
  })

  it('by default ignore some files and allow to ignore other', async () => {
    // Below files are part of defaultIgnores
    require('../mocks/README.md')
    require('../mocks/module/Dockerfile')
    require('../mocks/module/setupProxy.js')

    // Below file will be ignored
    require('../mocks/SIMPLE-READ.md')

    const message = await fileNamingEnforcer.validate(
      'type=kebabCase folder=./mocks ignore=[SIMPLE-READ.md]'
    )
    expect(message).toContain('Great, everything looks fine :)')
  })

  it('when a project convention is kebabCase and some files are wrong then we display an error message and kill a process', async () => {
    try {
      await fileNamingEnforcer.validate('type=kebabCase folder=./mocks')
    } catch (e) {
      expect(e.message).toContain(
        `Uuu, some files are not following your project naming convention (kebabCase). Please take a look on below files: mocks/SIMPLE-READ.md`
      )
    }

    expect.assertions(1)
  })

  it('when a project convention is capitalize and some files are wrong then we display an error message and kill a process', async () => {
    try {
      await fileNamingEnforcer.validate('folder=./mocks type=capitalize')
    } catch (e) {
      expect(e.message).toContain(
        `Uuu, some files are not following your project naming convention (capitalize). Please take a look on below files: mocks/SIMPLE-READ.md, mocks/simple-js-file.js, mocks/some-scss-file.sass`
      )
    }

    expect.assertions(1)
  })

  it('when a project convention is not supported then we display an error message and kill a process', async () => {
    try {
      await fileNamingEnforcer.validate('folder=./mocks type=newCase')
    } catch (e) {
      expect(e.message).toContain('Uuu, we do not support newCase')
    }

    expect.assertions(1)
  })

  it('when a folder is empty then we display a error message and kill a process', async () => {
    try {
      await fileNamingEnforcer.validate('type=kebabCase folder=./xxx')
    } catch (e) {
      expect(e.message).toContain(
        'Uuu, folder ./xxx is empty, please take a look on that'
      )
    }

    expect.assertions(1)
  })

  it('when we could not find any file with provided extension', async () => {
    try {
      await fileNamingEnforcer.validate('type=kebabCase folder=./mocks ext=tsx')
    } catch (e) {
      expect(e.message).toContain(
        'Uuu, in folder ./mocks we could not find any file with .tsx extension'
      )
    }

    expect.assertions(1)
  })

  it('when searched files are correct then we display a success message', async () => {
    const result = await fileNamingEnforcer.validate(
      'type=kebabCase folder=./mocks ext=sass'
    )
    expect(result).toContain('Great, everything looks fine :)')
  })
})
