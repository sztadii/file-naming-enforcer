# Welcome to **[file-naming-enforcer](https://github.com/sztadii/file-naming-enforcer)**!

## Problem to solve

If your team wants to follow any file naming convention, <br />
like a capital case for classes / components or kebab case for styles etc, <br />
then you should automate it and forget about the unnecessary discussion during code review. <br />

## How to install

```
npm i -D file-naming-enforcer
```

## How to use

```
"scripts": {
  "lint-components": "file-naming-enforcer type=capitalize folder=./src/components ext=js",
  "lint-styles": "file-naming-enforcer type=kebabCase folder=./src ext=scss",
  "lint-utils": "file-naming-enforcer type=camelCase folder=./src/utils ext=js",
  "lint-all": "file-naming-enforcer type=kebabCase ignore=[README.md,Dockerfile]",
}
```

PS. You can also use shortcut `fne`
```
fne type=capitalize folder=./src/components ext=js
```

## Expected result:

Once everything will be set up properly, <br />
and some files will be not following our project convention, <br />
then you should see below errors <br />

![Screenshot](https://raw.githubusercontent.com/sztadii/file-naming-enforcer/master/error-example.png?raw=true)
