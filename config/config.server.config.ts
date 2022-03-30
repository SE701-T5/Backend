import convict from 'convict';

export default convict({
  authToken: {
    format: String,
    default: 'X-Authorization',
  },
  databaseURI: {
    format: String,
    default: 'mongodb://localhost/uniforum',
    env: 'DATABASE_URI',
    sensitive: true,
  },
  databaseOptions: {
    format: Object,
    default: {
      useNewUrlParser: true,
      ssl: false,
      retryWrites: true,
    },
    env: 'DATABASE_OPTIONS',
  },
  port: {
    format: 'nat',
    default: 4200,
    env: 'PORT',
  },
  testing: {
    format: 'Boolean',
    default: false,
    env: 'TESTING',
  },
});
