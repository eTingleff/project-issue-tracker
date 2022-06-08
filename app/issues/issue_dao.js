'use strict';

const db = require('../../db');

exports.findOneIssue = (conditions, options = {}) => {

  return db.getInstance().collection('issues')
    .findOne(conditions, options);
}

exports.findIssues = (conditions, options = {}) => {

  return db.getInstance().collection('issues')
    .find(conditions, options)
    .toArray();
}

exports.insertIssue = (issueDocument) => {

  return db.getInstance().collection('issues')
    .insertOne(issueDocument);
}

exports.updateIssue = (filter, update) => {

  return db.getInstance().collection('issues')
    .updateOne(filter, update);
}

exports.deleteIssue = (query) => {

  return db.getInstance().collection('issues')
    .deleteOne(query);
}
