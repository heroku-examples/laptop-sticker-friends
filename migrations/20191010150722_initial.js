const constants = require('../src/constants')

exports.up = async (knex) => {
  await knex.schema.createTable('characters', (table) => {
    table.increments()
    table
      .string('name', 250)
      .unique()
      .notNullable()
    table.boolean('visible').notNullable()
  })

  await knex.schema.createTable('submissions', (table) => {
    table.increments()
    table.string('user_id', 50).notNullable()
    table
      .string('upload_id', 50)
      .unique()
      .notNullable()
    table
      .string('character_url', 250)
      .unique()
      .notNullable()
    table
      .string('image_url', 250)
      .unique()
      .notNullable()
    table
      .string('html_url', 250)
      .unique()
      .notNullable()
    table.timestamp('created_at').notNullable()
  })

  await knex.raw(`
    CREATE OR REPLACE FUNCTION notify_character_change()
      RETURNS trigger AS
    $BODY$
      BEGIN
        PERFORM pg_notify('${constants.CHARACTER_CHANGE}', row_to_json(NEW)::text);
        RETURN NULL;
      END;
    $BODY$
      LANGUAGE plpgsql VOLATILE
      COST 100;
   `)

  await knex.raw(`
    CREATE TRIGGER notify_character_change
    AFTER UPDATE OF visible ON characters
    FOR EACH ROW
    EXECUTE PROCEDURE notify_character_change()
  `)
}

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS notify_character_change ON characters')
  await knex.raw('DROP FUNCTION IF EXISTS notify_character_change()')
  await knex.schema.dropTableIfExists('characters')
  await knex.schema.dropTableIfExists('submissions')
}
