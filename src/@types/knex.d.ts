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
      session_id: string
      name: string
      description: string | null
      isInDiet: 'in' | 'out'
      eated_at: string
      created_at: string
    }
  }
}
