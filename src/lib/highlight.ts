import * as prism from 'prismjs'
import * as supportsColor from 'supports-color'

function highjackRenderer() {
  // @ts-ignore
  prism.Token = (...args: any[]) => {
    // @ts-ignore
    prism.Token.apply(this, [].slice.call(args))
  }

  // @ts-ignore
  prism.Token.stringify = function (token: prism.TokenStream, language: string, parent?: (string | prism.Token)[] | undefined, newlines: boolean) {
    let ansiMapping: { [key: string]: string }

    if (!supportsColor.stdout) {
      return token
    }

    if (supportsColor.stdout.has256) {
      ansiMapping = {
        function: '\x1b[37m',
        comment: '\x1b[38;5;241m',
        keyword: '\x1b[38;5;31m',
        string: '\x1b[38;5;28m',
        regex: '\x1b[38;166m',
        punctuation: '',
        operator: '',
        number: '\x1b[38;5;160m',
      }
    } else {
      ansiMapping = {
        function: '\x1b[1;37m',
        comment: '\x1b[36m',
        keyword: '\x1b[01;34m',
        string: '\x1b[1;32m',
        regex: '\x1b[1;33m',
        punctuation: '',
        operator: '',
        number: '\x1b[01;31m',
      }
    }

    if (typeof token === 'string') {
      return token
    }

    if (Array.isArray(token)) {
      // @ts-ignore
      return token.map(function (element) {
        return prism.Token.stringify(element, language, token)
      }).join('')
    }

    const env = {
      type: token.type,
      content: prism.Token.stringify(token.content, language, parent),
      tag: 'span',
      classes: ['token', token.type],
      attributes: {},
      language: language,
      parent: parent,
    }

    prism.hooks.run('wrap', env)

    function format(str: string): string {
      return `${ansiMapping[env.type]}${str}\x1b[0m`
    }

    if (typeof ansiMapping[env.type] !== 'undefined') {
      if (newlines) {
        return env.content.split('\n').map(format).join('\n')
      }

      return format(env.content)
    }

    return env.content
  }
}

/* eslint-enable */
/* tslint:enable */

export function highlight(text: string, language: string): string {
  let grammar = prism.languages[language]

  highjackRenderer()

  try {
    require(`prismjs/components/prism-${language}.min.js`)
    grammar = prism.languages[language]
  } catch (error) {
    const languages = Object.keys(require('prismjs/components.js').languages)
    throw new Error(`Unknown language ${language}, available languages are ${languages.join(', ')}`)
  }

  const tokens = prism.tokenize(text, grammar)
  return prism.Token.stringify(tokens, language)
}
