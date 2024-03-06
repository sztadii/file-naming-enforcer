export class ProcessService {
  public killProcess(): void {
    process.exit(1)
  }

  public getArguments<T extends object>(
    processArgs: string,
    argumentsNames: Array<keyof T>
  ): T {
    const processArgsList = processArgs.split(' ')
    return argumentsNames.reduce((allArguments, currentArgument) => {
      const searchedArgument = processArgsList.find(e =>
        e.includes(currentArgument.toString())
      )
      return {
        ...allArguments,
        ...this.parseProcessArgumentToObject(searchedArgument)
      }
    }, {}) as T
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

type JSONObject = Record<string, string | string[]>
