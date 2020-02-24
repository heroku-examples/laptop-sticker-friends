const constants = require('./constants')

exports.characters = {
  handler: async (req) => {
    return req.server.plugins.db.getCharacters()
  }
}

exports.getAttendeeApp = {
  handler: async (req) => {
    return req.server.plugins.db.getLatestApp()
  }
}

exports.sendAttendeeApp = {
  handler: async (req) => {
    req.server.plugins.ws.sendStatus(constants.ATTENDEE_STATUS)

    const payload = req.payload || {}
    req.log(['attendee-app'], { payload })

    // This route can be used by the attendee apps as a simple ping or to
    // set their name in the database
    const { name } = payload
    if (name) {
      req.server.plugins.ws.sendAttendeeApp({ name })
      await req.server.plugins.db.saveAttendeeApp({ name })
    }

    return { status: 'success' }
  }
}
