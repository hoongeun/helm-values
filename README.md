helm-values
===========

Helm plugin to manage multiple subcharts' values by env.


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/helm-values.svg)](https://npmjs.org/package/helm-values)
[![Downloads/week](https://img.shields.io/npm/dw/helm-values.svg)](https://npmjs.org/package/helm-values)
[![License](https://img.shields.io/npm/l/helm-values.svg)](https://github.com/hoongeun/helm-values/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Why I made this?
There's already exists simmilar project [helm-values](https://github.com/shihyuho/helm-values). But it doesn't meet my needs.

My needs are
* Helm doesn't support the env patch feature like [kustomize](https://kustomize.io)
* I want to manage values.yaml by dividing in each subcharts
* A json, yaml formats aren't programmable

So I decided to make my own tools for these.

## How it works?
1. init - Initiate the helm-values
2. generate - A helper tools to generate multiple manifests or templates in single command
3. combine - Combine template([nunjucks](https://mozilla.github.io/nunjucks/), [ejs](https://ejs.co/)) with data model
4. patch - Patch `[stage].yaml` with `base.yaml` if it is avaiable
5. merge - Merge subcharts
6. clean - A helper tools to clean the `values.yaml` and processed data


# Usage
<!-- usage -->
```sh-session
$ helm plugin install https://github.com/hoongeun/helm-values.git # or yarn global add helm-values
$ cd [HELM_DIRECTORY]
$ helm-values init
running command...
$ helm-values generate -s dev -s prod -s test
# helm-values automactically parse the chart.yaml or requirements.yaml files in your [HELM_DIRECTORY]
# You can also set the charts manually by adding argv
# ex) helm-values generate -s dev -s prod -s test mysql redis
$ helm-values build [CHART]
USAGE
  $ helm-values COMMAND
$ helm-values --help [COMMAND]
USAGE
  $ helm-values COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`helm-values init`](#helm-values-init)
* [`helm-values generate [CHART]...`](#helm-values-generate-chart)
* [`helm-values build [CHART]...`](#helm-values-build-chart)
* [`helm-values combine [CHART]...`](#helm-values-combine-chart)
* [`helm-values patch [CHART]...`](#helm-values-patch-chart)
* [`helm-values merge [CHART]...`](#helm-values-merge-chart)
* [`helm-values clean [CHART]...`](#helm-values-clean-chart)
* [`helm-values help [COMMAND]...`](#helm-values-help-command)

## `helm-values init`

describe the command here

```
USAGE
  $ helm-values init

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ helm-values hello
  hello world from ./src/hello.ts!
```


## `helm-values generate [CHART]`

display generate for helm-values

```
USAGE
  $ helm-values help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


## `helm-values build [CHART]`

display build for helm-values

```
USAGE
  $ helm-values help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


## `helm-values combine [CHART]`

display combine for helm-values

```
USAGE
  $ helm-values help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


## `helm-values patch [CHART]`

display merge for helm-values

```
USAGE
  $ helm-values help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


## `helm-values merge [CHART]`

display merge for helm-values

```
USAGE
  $ helm-values help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


<!-- commandsstop -->
