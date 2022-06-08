'use strict';

const db = require('../../db');

exports.findOneProject = (conditions, options = {}) => {

  return db.getInstance().collection('projects')
    .findOne(conditions, options);
}

exports.insertOneProject = (projectDocument) => {

  return db.getInstance().collection('projects')
      .insertOne(projectDocument);
}

exports.updateOneProject = (filter, update) => {

  return db.getInstance().collection('projects')
    .updateOne(filter, update);
}
