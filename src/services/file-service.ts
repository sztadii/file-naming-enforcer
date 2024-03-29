import * as find from 'find'
import * as fs from 'fs'

export class FileService {
  public getFiles(folder: string, ext: string): Promise<string[]> {
    return new Promise((resolve, reject) =>
      find.file(new RegExp(`\\.${ext}$`), folder, resolve).error(reject)
    )
  }

  public async createFiles(folder: string, fileNames: string[]) {
    for (const fileName of fileNames) {
      await this.createFile(folder, fileName)
    }
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

  public async removeFolder(folder: string | RegExp) {
    if (typeof folder === 'string') {
      await fs.promises.rmdir(folder, { recursive: true })
      return
    }

    const folders = await this.getFoldersNames('.')
    const filteredFolders = folders.filter(filteredFolder =>
      folder.test(filteredFolder)
    )
    await Promise.all(filteredFolders.map(this.removeFolder))
  }

  private async getFoldersNames(rootFolder: string): Promise<string[]> {
    const files = await fs.promises.readdir(rootFolder, { withFileTypes: true })

    return files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  }
}
