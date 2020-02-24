const constants = [
  'CHARACTER_CHANGE',
  'SUBMISSION',
  'STATUS_UPDATE',
  'BACKGROUND_CHANGE',
  'DATABASE_STATUS',
  'KAFKA_STATUS',
  'ATTENDEE_STATUS',
  'ATTENDEE_APP'
]

module.exports = new Proxy(
  constants.reduce((acc, key) => ((acc[key] = key), acc), {}),
  {
    get: function(target, name) {
      // Since this getter gets called for all keys, some values need to be ignored
      if (
        // If this proxy gets logged or inspected then name
        // could be a symbol or the string inspect
        typeof name === 'symbol' ||
        name === 'inspect' ||
        // In a babel/webpack env, this string gets read from the resulting export
        name === '__esModule'
      ) {
        return
      }

      // If it is one of our constant values, then yay! return it
      if (Object.prototype.hasOwnProperty.call(target, name)) {
        return target[name]
      }

      // Otherwise log (in a browser) or error (on the server)
      const message = `No ${name} constant exists`
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error(message)
      } else {
        throw new Error(message)
      }
    },
    set: function() {
      // No setting allowed after the module gets exported
      throw new Error(`Can't set constant value during runtime`)
    }
  }
)
