const pgp = require('pg-promise')()

const register = async (server, options) => {
  const { db: dbOptions, subscriptions } = options

  server.log(['db'], dbOptions)
  const db = pgp(dbOptions)

  if (subscriptions) {
    const sco = await db.connect({ direct: true })
    Object.keys(subscriptions).map((key) => {
      sco.client.on('notification', (data) =>
        subscriptions[key](data.payload, data)
      )
      sco.none('LISTEN $1~', key)
    })
  }

  server.expose('pg', db)

  server.expose('getCharacters', async () => {
    const characters = await db.any('SELECT * FROM characters')
    return characters.reduce((acc, char) => {
      acc[char.name] = char.visible
      return acc
    }, {})
  })

  server.expose('saveAttendeeApp', async (data) => {
    server.log(['db', 'save-attendee-app'], data)
    await db.none(
      'INSERT INTO attendee_apps(name, created_at) VALUES($1, $2)',
      [data.name, new Date()]
    )
  })

  server.expose('getLatestApp', async () => {
    const attendeeApp = await db.any(
      'SELECT * FROM attendee_apps ORDER BY created_at DESC LIMIT 1'
    )

    if (!attendeeApp.length) {
      return {}
    }

    return attendeeApp[0]
  })

  server.expose('saveSubmission', async (data) => {
    server.log(['db', 'save-submission'], data)
    await db.none(
      'INSERT INTO submissions(user_id, upload_id, image_url, character_url, html_url, created_at) VALUES($1, $2, $3, $4, $5, $6)',
      [
        data.user.id,
        data.uploadId,
        data.image,
        data.character,
        data.html,
        new Date()
      ]
    )
  })
}

exports.plugin = {
  name: 'db',
  once: true,
  register
}
