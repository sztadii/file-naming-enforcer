#!/usr/bin/env node

import FileNamingEnforcer from './file-naming-enforcer'
import { ProcessService, FileService, Logger } from './services'

async function run() {
  const fileNamingEnforcer = new FileNamingEnforcer(
    new ProcessService(),
    new FileService(),
    new Logger()
  )
  await fileNamingEnforcer.enforce(process.argv.join(' '))
}

run()
