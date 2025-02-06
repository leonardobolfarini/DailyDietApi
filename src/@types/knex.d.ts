// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      avatarUrl: string | null
    }

    meals: {
      id: string
      name: string
      description: string | null
      isInDiet: 'in' | 'out'
      created_at: string
    }
  }
}
