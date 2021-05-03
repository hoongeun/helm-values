import {expect, test} from '@oclif/test'
import {stripIndent} from 'common-tags'
import {highlight} from '../../src/lib/highlight'

describe('highlight', () => {
  test.it('render yaml', () => {
    expect(
      highlight(
        stripIndent`
        str: 'string'
        boolean: true
        number: 100
        array:
            - item1
            - item2
        obj:
            item1: 1
            item2: 2
        # comment
        `,
        'yaml',
      ),
    ).to.string(stripIndent`
          str:[0m [38;5;28m'string'[0m
          boolean:[0m true
          number:[0m [38;5;160m100[0m
          array:[0m
              -[0m item1
              -[0m item2
          obj:[0m
              item1:[0m [38;5;160m1[0m
              item2:[0m [38;5;160m2[0m
          [38;5;241m# comment[0m`)
  })

  test.it('render json', () => {
    expect(
      highlight(
        stripIndent`
        {
          'str': 'string',
          'boolean': true,
          'number': 100,
          'array': [
            'item1',
            'item2'
          ],
          'obj': {
            'item1': 1,
            'item2': 2
          }
        }
        `,
        'json',
      ),
    ).to.string(stripIndent`
      {[0m
        'str':[0m 'string',[0m
        'boolean':[0m true,[0m
        'number':[0m [38;5;160m100[0m,[0m
        'array':[0m [[0m
          'item1',[0m
          'item2'
        ][0m,[0m
        'obj':[0m {[0m
          'item1':[0m [38;5;160m1[0m,[0m
          'item2':[0m [38;5;160m2[0m
        }[0m
      }[0m`)
  })
})
