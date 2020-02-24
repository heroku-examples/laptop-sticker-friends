const controllers = require('./controllers')

module.exports = [
  {
    method: 'GET',
    path: '/api/characters',
    config: controllers.characters
  },
  {
    method: 'GET',
    path: '/api/attendee-app',
    config: controllers.getAttendeeApp
  },
  {
    method: 'POST',
    path: '/api/attendee-app',
    config: controllers.sendAttendeeApp
  }
]
