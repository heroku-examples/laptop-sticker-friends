exports.seed = async (knex) => {
  await knex('characters').del()
  await knex('characters').insert(
    ['max', 'appy', 'cloudy', 'astro', 'codey', 'blaze'].map((name) => ({
      name,
      visible: true
    }))
  )
}
