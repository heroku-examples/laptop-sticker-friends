# Friends from the Trail app

## Local Development

In order to speed up local development, env vars can be written to a `.env` file instead of being requested each time the server process starts.

A helper file is included to write the necessary values to the `.env` file:

```sh
./bin/write-env friends-from-the-trail-staging
```

### Using a Local Database

You'll want to use a local database if your editing the schema or making other data changes. If not you can use the `$DATABASE_URL` written to your `.env` file above.

Create a `config/local.json` file with your local database information like this. You'll need to make sure this database table is created locally.

```json
{
  "db": {
    "user": "lukekarrys",
    "database": "friends-from-the-trail"
  }
}
```

And then run migrations and seeds to setup the database with the required data:

```sh
npx knex migrate:latest
npx knex seed:run
```

### Using the server database

Create a `config/local.json` with the following and then it will use the server database connection from the `.env` file:

```json
{
  "db": "${DATABASE_URL}?ssl=true"
}
```

### Running the App

```sh
npm start
```

If you want to simulate production

```sh
NODE_ENV=production npm start
```

## Deploying

The client files in `app/` will be built along with each deploy.

## Kafka Topics

Required topics are listed in [`config/default.json#kafka`](./config/default.json). They can be created by running:

```sh
heroku kafka:topics:create "$(heroku config:get KAFKA_PREFIX)submission-app"
heroku kafka:topics:create "$(heroku config:get KAFKA_PREFIX)change-background"
```

## Region Flag

The design contains a flag that will be changed depending on the `REGION` environment variable. The possible values are: `dublin`, `frankfurt`, `oregon`, `sydney`, `tokyo`, `virginia`. If no valid value is set then it will default to a Heroku flag.
