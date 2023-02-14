import test from 'ava'
import { Type, Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { Filter, Create, Find, Replace, Modify, Remove } from '../src'

const keyOn = ['id'] as const

const filterOn = ['surname'] as const

const PersonSchema = Type.Object({
    id: Type.String({ minLength: 36, maxLength: 36 }),
    givenName: Type.String(),
    surname: Type.String()
})

const PersonController = {
    filter: Filter(PersonSchema, ...filterOn),
    create: Create(PersonSchema),
    find: Find(PersonSchema, ...keyOn),
    replace: Replace(PersonSchema, ...keyOn),
    modify: Modify(PersonSchema, ...keyOn),
    remove: Remove(PersonSchema, ...keyOn)
}

test('creates a filter function schema', t => {
    const filterCb: Static<typeof PersonController.filter> = () => [Value.Create(PersonSchema)]
    t.is(TypeCompiler.Compile(PersonController.filter).Check(filterCb), true)
})

test('creates a create function schema', t => {
    const createCb: Static<typeof PersonController.create> = () => Value.Create(PersonSchema)
    t.is(TypeCompiler.Compile(PersonController.create).Check(createCb), true)
})

test('creates a find function schema', t => {
    const findCb: Static<typeof PersonController.find> = () => Value.Create(PersonSchema)
    t.is(TypeCompiler.Compile(PersonController.find).Check(findCb), true)
})

test('creates a replace function schema', t => {
    const replaceCb: Static<typeof PersonController.replace> = () => Value.Create(PersonSchema)
    t.is(TypeCompiler.Compile(PersonController.replace).Check(replaceCb), true)
})

test('creates a modify function schema', t => {
    const modifyCb: Static<typeof PersonController.modify> = () => Value.Create(PersonSchema)
    t.is(TypeCompiler.Compile(PersonController.modify).Check(modifyCb), true)
})

test('creates a remove function schema', t => {
    const removeCb: Static<typeof PersonController.remove> = () => {}
    t.is(TypeCompiler.Compile(PersonController.remove).Check(removeCb), true)
})
