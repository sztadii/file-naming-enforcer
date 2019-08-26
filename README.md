# Welcome to **[file-naming-enforcer](https://github.com/sztadii/file-naming-enforcer)**!

## Why

If a team want to keep only one file naming convention we should automate that process
and forget about small issues during PRs

## Examples of using
* file-naming-enforcer type=kebab-case path=./src/* ignore=['./README.md', 'Dockerfile'] 
* file-naming-enforcer type=capitalize path=./src/components/*.js
* file-naming-enforcer type=camel-case path=./src/utils/*
* file-naming-enforcer type=kebab-case path=./src/utils/new-file.js
