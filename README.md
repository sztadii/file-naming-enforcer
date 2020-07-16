# Welcome to **[file-naming-enforcer](https://github.com/sztadii/file-naming-enforcer)**!

## Problem to solve

If your team wants to follow some file name conventions,
like a capital case for classes for components or kebab case for styles or any other,
then you should automate it and forget about the unnecessary discussion during code review.

## How to install

```
npm i -D file-naming-enforcer
```

## Example

```
"scripts": {
  "lint-components": "file-naming-enforcer type=capitalize folder=./src/components ext=js",
  "lint-styles": "file-naming-enforcer type=kebabCase folder=./src ext=scss",
  "lint-utils": "file-naming-enforcer type=camelCase folder=./src/utils ext=js",
  "lint-all": "file-naming-enforcer type=kebabCase ignore=[README.md,Dockerfile]",
}
```
