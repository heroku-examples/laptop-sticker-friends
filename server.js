require('dotenv').config()

const Hapi = require('@hapi/hapi')
const config = require('getconfig')
const pack = require('./package')
const constants = require('./src/constants')

const IS_DEV = config.getconfig.isDev

const start = async () => {
  const hapiConfig = config.hapi
  const server = new Hapi.Server(hapiConfig)

  await server.register({
    plugin: require('hapi-pino'),
    options: {
      prettyPrint: IS_DEV,
      redact: !IS_DEV && ['*.aws.id', '*.aws.secret', '*.db']
    }
  })

  server.log(['start', 'getconfig'], config)
  server.log(['start'], hapiConfig)

  await server.register(require('./src/ws'))

  if (IS_DEV) {
    await server.register({
      plugin: require('./src/hapi-webpack'),
      options: {
        dev: {
          publicPath: '/'
        },
        hot: {
          name: pack.name
        }
      }
    })
  } else {
    // Static files are only need in production
    // This plugin will register routes and responses to serve all client files
    // from the built webpack directory and also serve the index for all 404s
    await server.register({
      plugin: require('./src/static-plugin'),
      options: {
        directoryPath: 'dist'
      }
    })
  }

  await server.register({
    plugin: require('./src/db'),
    options: {
      db: config.db,
      subscriptions: {
        [constants.CHARACTER_CHANGE]: (payload) => {
          server.plugins.ws.sendStatus(constants.DATABASE_STATUS)
          server.plugins.ws.sendCharacterChange(payload)
        }
      }
    }
  })

  const { submissionTopic, backgroundTopic } = config.kafka
  await server.register({
    plugin: require('./src/kafka-plugin'),
    options: {
      subscriptions: {
        [submissionTopic]: (messages) => {
          for (const message of messages) {
            server.plugins.ws.sendStatus(constants.KAFKA_STATUS)
            server.plugins.ws.sendSubmission(message)
            server.plugins.db.saveSubmission(message)
          }
        },
        [backgroundTopic]: () => {
          // Only one change per timeout can occur
          server.plugins.ws.sendStatus(constants.KAFKA_STATUS)
          server.plugins.ws.sendBackgroundChange()
        }
      },
      kafka: {
        idleTimeout: 100,
        connectionTimeout: 10 * 1000,
        clientId: 'kafka-consumer',
        consumer: {
          connectionString: config.kafka.url
        }
      }
    }
  })

  server.route(require('./src/routes'))

  server.start()
  server.log(['start'], server.info.uri)
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
})
