exports.rethinkdb = {
  host: process.env.RETHINKDB_HOST,
  port: process.env.RETHINKDB_PORT,
};

exports.secret = process.env.SECRET || 'keepitsafe';

exports.google = {
  id: process.env.GOOGLE_CLIENT_ID || '702998348467-et2j4qfv162rdksr8ld8ut9c5lg6vk94.apps.googleusercontent.com',
  secret: process.env.GOOGLE_SECRET || 'ff3AtoKJ09jDWIFVfRfexNXW',
};

exports.assets = {
  development: {
    css: ['css/main.css']
  },
  production: {
    css: ['css/main.min.css']
  }
}
