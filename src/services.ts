import * as find from 'find'
import * as fs from 'fs'

export class ProcessService {
  public failProcess(): void {
    process.exit(1)
  }

  public getArguments<T extends object>(
    processArgs: string,
    argumentsNames: Array<keyof T>
  ): T {
    const processArgsList = processArgs.split(' ')
    const parsedArguments = argumentsNames.reduce(
      (allArguments, currentArgument) => {
        const searchedArgument = processArgsList.find(e =>
          e.includes(currentArgument.toString())
        )
        return {
          ...allArguments,
          ...this.parseProcessArgumentToObject(searchedArgument)
        }
      },
      {}
    ) as T

    return parsedArguments
  }

  private parseProcessArgumentToObject(processArgument: string): JSONObject {
    if (!processArgument) return {}
    const [key, val] = processArgument.split('=')
    const parsedValue = val.includes('[') ? this.parseTextToArray(val) : val
    return {
      [key]: parsedValue
    }
  }

  private parseTextToArray(text: string): string[] {
    return text
      .replace('[', '')
      .replace(']', '')
      .split(',')
  }
}

type JSONObject = {
  [key: string]: string | string[]
}

export class FileService {
  public getFiles(folder: string, ext: string): Promise<string[]> {
    return new Promise((resolve, reject) =>
      find.file(new RegExp(`\\.${ext}$`), folder, resolve).error(reject)
    )
  }

  public async createFile(
    folder: string,
    fileName: string,
    content = 'Random content'
  ): Promise<void> {
    if (!this.hasFolder(folder)) {
      await this.createFolder(folder)
    }
    await fs.writeFile(`${folder}/${fileName}`, content, () => {})
  }

  public hasFolder(folder: string): boolean {
    return fs.existsSync(folder)
  }

  public async createFolder(folder: string) {
    await fs.promises.mkdir(folder)
  }

  public async removeFolder(folder: string) {
    // @ts-ignore
    await fs.promises.rmdir(folder, { recursive: true })
  }
}

export class Logger {
  public log(message: string) {
    console.log(message)
  }
}
