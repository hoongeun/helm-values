import {expect, test} from '@oclif/test'
import outdent from 'outdent'
import { highlight } from '../../src/lib/highlight'

describe('highlight', () => {
    test.it('render yaml', () => {
        expect(highlight(outdent`str: "string"
            boolean: true
            number: 100
            array:
                - item1
                - item2
            obj:
                item1: 1
                item2: 2
            # comment
            `, 'yaml'))
        .to.string(outdent`str:[0m [1;32m"string"[0m
            boolean:[0m true
            number:[0m [01;31m100[0m
            array:[0m
                -[0m item1
                -[0m item2
            obj:[0m
                item1:[0m [01;31m1[0m
                item2:[0m [01;31m2[0m
            [36m# comment[0m`)
    })
})