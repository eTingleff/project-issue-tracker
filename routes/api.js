'use strict';

const issueController = require('../app/issues/issue_service');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let projectName = req.params.project;
      const response = await issueController.getIssuesService(projectName, req.query);

      return res.json(response);
    })

    .post(async (req, res) => {
      let projectName = req.params.project;
      const response = await issueController.createIssueService(projectName, req.body);

      return res.json(response);
    })

    .put(async (req, res) => {
      const response = await issueController.updateIssueService(req.body)

      return res.json(response);
    })

    .delete(async (req, res) => {
      const projectName = req.params.project;
      const response = await issueController.deleteIssueService(projectName, req.body);

      return res.json(response);
    });

};
