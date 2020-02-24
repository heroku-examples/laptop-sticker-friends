exports.up = async (knex) => {
  await knex.schema.createTable('attendee_apps', (table) => {
    table.increments()
    table.string('name', 250).notNullable()
    table.timestamp('created_at').notNullable()
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('attendee_apps')
}
