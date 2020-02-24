const Kafka = require('no-kafka')

const register = async (server, options) => {
  const { kafka, subscriptions } = options

  server.log(['kafka'], kafka)
  const kafkaConsumer = new Kafka.SimpleConsumer(kafka)

  await kafkaConsumer.init()

  await Promise.all(
    Object.keys(subscriptions).map((topic) =>
      kafkaConsumer.subscribe(topic, (messageSet) => {
        const messages = messageSet.map((m) =>
          JSON.parse(m.message.value.toString('utf8'))
        )
        server.log(['kafka'], {
          topic,
          length: messages.length,
          messages
        })
        subscriptions[topic](messages, messageSet)
      })
    )
  )
}

exports.plugin = {
  name: 'kafka',
  once: true,
  register
}
