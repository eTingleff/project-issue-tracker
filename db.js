'use strict';

const { MongoClient } = require('mongodb');
const mongoUrl = process.env['MONGODB_URI'];
const db_name = process.env['DB_NAME'];
const connectionConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let _db;

module.exports = {
  async connect() {
    const client = new MongoClient(mongoUrl, connectionConfig);
    await client.connect();
    _db = client.db(db_name);
  },

  getInstance() {
    return _db;
  },

  getCollection(name) {
    return _db.collection(name);
  },
};
