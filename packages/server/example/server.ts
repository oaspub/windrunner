import { Static, Type } from '@sinclair/typebox'
import {
    Contract,
    CreateDefinition,
    FilterDefinition,
    RemoveDefinition
} from '@windrunner/contract'
import { WebServer } from '../src'
import * as crypto from 'crypto'
import { WebServerCallback } from '../src/Controller'

/************************
 *         Model        *
 ************************/

const PersonSchema = Type.Object({
    id: Type.String(),
    givenName: Type.String(),
    surname: Type.String()
}, { $id: 'person' })

type Person = Static<typeof PersonSchema>

/************************
 *       Contract       *
 ************************/

const PersonContract = new Contract('Persons', {
    /** Add operation definitions in the constructor or... */
    addPerson: new CreateDefinition(PersonSchema.$id!, PersonSchema, Type.Omit(PersonSchema, ['id'])),
    removePerson: new RemoveDefinition(PersonSchema.$id!, Type.Pick(PersonSchema, ['id'])),
})
  /** ...add them with method chaining */
  .declare('listPersons', new FilterDefinition(PersonSchema.$id!, PersonSchema, Type.Pick(PersonSchema, ['surname'])))

/************************
 *      Web Server      *
 ************************/

const PersonsRepository = new Map<string, Person>()

const server = new WebServer(PersonContract, {
    /** Define controllers with type-completion in the constructor or... */
    addPerson: ({ body: { givenName, surname } }) => {
        const id = crypto.randomUUID()
        const person = { id, givenName, surname }
        PersonsRepository.set(id, person)
        return person
    },
    removePerson: ({ params: { id } }) => {
        PersonsRepository.delete(id)
        return
    }
})
  /** ...add them with method chaining */
  .declare('listPersons', ({ queries: { surname } }) => {
      const persons: Person[] = []
      for (const [_, person] of PersonsRepository.entries()) {
          if (person.surname === surname) persons.push(person)
      }
      return persons
  })

if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8080
    // const host = 'localhost'
    server.listen(port, '127.0.0.1', () => console.info('Listing on port', port))
}

/************************
 * TODO Client SDK      *
 ************************/

// const personClient = new Client(PersonContract)
// personClient.addPerson({ givenName: 'Cosmo', surname: 'Cougar' })
