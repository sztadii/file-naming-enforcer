# Welcome to **[file-naming-enforcer](https://github.com/sztadii/file-naming-enforcer)**!

## Why

If a team want to keep only one file naming convention we should automate that process
and forget about small issues during PRs

Example
```
"scripts": {
  "lint-react-components": "file-naming-enforcer type=capitalize folder=./components ext=js"
  "lint-styles": "file-naming-enforcer type=kebabCase folder=./src ext=scss"
  "lint-utils": "file-naming-enforcer type=camelCase folder=./src/utils ext=js"
  ...
}
```
