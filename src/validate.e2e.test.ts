const { execute } = require('@getvim/execute')

describe('validate function', () => {
  it('when type is missing then we display an error message and kill a process', async () => {
    try {
      await execute('npx ts-node src/index folder=./mocks')
    } catch (e) {
      const { stdout } = e
      expect(stdout).toContain('Uuu, `type` flag is missing')
    }

    expect.assertions(1)
  })

  it('when a project convention is kebabCase and all files are correct then we display a success message', async () => {
    const stdout = await execute(
      'npx ts-node src/index type=kebabCase folder=./mocks ignore=[SIMPLE-READ.md]'
    )
    expect(stdout).toBe('Great, everything looks fine :)')
  })

  it('ignore correctly some files', async () => {
    require('../mocks/README.md')
    require('../mocks/module/Dockerfile')
    require('../mocks/module/setupProxy.js')
    const stdout = await execute(
      'npx ts-node src/index type=kebabCase folder=./mocks ignore=[SIMPLE-READ.md]'
    )
    expect(stdout).toContain('Great, everything looks fine :)')
  })

  it('when a project convention is kebabCase and some files are wrong then we display an error message and kill a process', async () => {
    try {
      await execute('npx ts-node src/index type=kebabCase folder=./mocks')
    } catch (e) {
      const { stdout } = e
      expect(stdout).toContain(
        `Uuu, some files are not following your project naming convention (kebabCase). Please take a look on below files [ 'mocks/SIMPLE-READ.md' ]`
      )
    }

    expect.assertions(1)
  })

  it('when a project convention is capitalize and some files are wrong then we display an error message and kill a process', async () => {
    try {
      await execute('npx ts-node src/index folder=./mocks type=capitalize')
    } catch (e) {
      const { stdout } = e
      expect(stdout).toContain(
        `Uuu, some files are not following your project naming convention (capitalize). Please take a look on below files [
  'mocks/SIMPLE-READ.md',
  'mocks/simple-js-file.js',
  'mocks/some-scss-file.sass'
]`
      )
    }

    expect.assertions(1)
  })

  it('when a project convention is not supported then we display an error message and kill a process', async () => {
    try {
      await execute('npx ts-node src/index folder=./mocks type=newCase')
    } catch (e) {
      const { stdout } = e
      expect(stdout).toContain('Uuu, we do not support newCase')
    }

    expect.assertions(1)
  })

  it('when a folder is empty then we display a error message and kill a process', async () => {
    try {
      await execute('npx ts-node src/index type=kebabCase folder=./xxx')
    } catch (e) {
      const { stdout } = e
      expect(stdout).toContain('Uuu, folder ./xxx is empty, please take a look on that')
    }

    expect.assertions(1)
  })

  it('when we could not find any file with provided extension', async () => {
    try {
      await execute('npx ts-node src/index type=kebabCase folder=./mocks ext=tsx')
    } catch (e) {
      const { stdout } = e
      expect(stdout).toContain(
        'Uuu, in folder ./mocks we could not find any file with .tsx extension'
      )
    }

    expect.assertions(1)
  })

  it('when searched files are correct then we display a success message', async () => {
    const stdout = await execute('npx ts-node src/index type=kebabCase folder=./mocks ext=sass')
    expect(stdout).toContain('Great, everything looks fine :)')
  })
})
