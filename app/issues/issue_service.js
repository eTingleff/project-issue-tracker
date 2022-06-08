'use strict';

const { ObjectId } = require('mongodb');

const { findOneProjectService } = require('../projects/project_service');
const {
  insertOneProject,
  updateOneProject,
} = require('../projects/project_dao');
const {
  findOneIssue,
  findIssues,
  insertIssue,
  updateIssue,
  deleteIssue,
} = require('./issue_dao');

exports.getIssuesService = async (projectName, query = {}) => {
  try {
    const project = await findOneProjectService(projectName);
    if (!project) {

      return {
        status: 404,
      };
    }

    const issueIds = project.issues;
    if (!issueIds || !issueIds.length) {

      return [];
    }

    const conditions = {
      _id: {
        $in: issueIds,
      },
    };

    if (query.issue_title && query.issue_title.trim()) {
      conditions.issue_title = query.issue_title.trim();
    }
    if (query.issue_text && query.issue_text.trim()) {
      conditions.issue_text = query.issue_text.trim();
    }
    if (query.created_by && query.created_by.trim()) {
      conditions.created_by = query.created_by.trim();
    }
    if (query.assigned_to && query.assigned_to.trim()) {
      conditions.assigned_to = query.assigned_to.trim();
    }
    if (query.status_text && query.status_text.trim()) {
      conditions.status_text = query.status_text.trim();
    }
    if (query.open && query.open.trim()) {
      conditions.open = query.open.trim() === 'true';
    }

    const issues = await findIssues(conditions);

    return issues;
  } catch (err) {
    console.error('getIssuesService error: ', err);

    return {
      status: 500,
    };
  }
}

exports.createIssueService = async (projectName, body) => {
  try {
    let project = await findOneProjectService(projectName);
    if (!project) {
      const newProject = {
        name: projectName,
        issues: [],
        created_on: new Date(),
        updated_on: new Date(),
      };

      project = await insertOneProject(newProject);
    }

    const {
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
    } = body;

    if (!issue_title || !issue_text || !created_by) {
      return {
        error: 'required field(s) missing',
      };
    }

    const newIssue = {
      issue_title,
      issue_text,
      created_by,
      assigned_to: '',
      status_text: '',
      project_id: project._id
        ? project._id
        : project.insertedId,
      open: true,
      created_on: new Date(),
      updated_on: new Date(),
    };

    if (assigned_to) {
      newIssue.assigned_to = assigned_to;
    }

    if (status_text) {
      newIssue.status_text = status_text;
    }

    // insert issue
    const insertIssueResult = await insertIssue(newIssue);

    // update project (push issue ObjectId to project.issues)
    const projectUpdate = {
      $push: {
        issues: insertIssueResult.insertedId,
      },
    };

    await updateOneProject(
      { _id: newIssue.project_id },
      projectUpdate,
    );

    const id = insertIssueResult.insertedId;
    const insertedIssue = await findOneIssue({ _id: id });

    return insertedIssue;
  } catch (err) {
    console.error('createIssueService error: ', err);

    return {
      status: 500,
    }
  }
}

exports.updateIssueService = async (body) => {
  try {
    const {
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open,
    } = body;

    if (!_id) {

      return {
        error: 'missing _id',
      };
    }

    if (!ObjectId.isValid(_id.trim())) {

      return {
        error: 'could not update',
        _id: _id.trim(),
      };
    }

    const id = new ObjectId(_id.trim());
    const issue = await findOneIssue({ _id: id });

    if (!issue) {

      return {
        error: 'could not update',
        _id: id,
      };
    }

    let changeFlag = false;

    let title = issue_title ? issue_title.trim() : '';
    if (title && title !== issue.issue_title) {
      issue.issue_title = title;
      changeFlag = true;
    }

    let text = issue_text ? issue_text.trim() : '';
    if (text && text !== issue.issue_text) {
      issue.issue_text = text;
      changeFlag = true;
    }

    let createdBy = created_by ? created_by.trim() : '';
    if (createdBy && createdBy !== issue.created_by) {
      issue.created_by = createdBy;
      changeFlag = true;
    }

    let assignedTo = assigned_to ? assigned_to.trim() : '';
    if (assignedTo && assignedTo !== issue.assigned_to) {
      issue.assigned_to = assignedTo;
      changeFlag = true;
    }

    let statusText = status_text ? status_text.trim() : '';
    if (statusText && statusText !== issue.status_text) {
      issue.status_text = statusText;
      changeFlag = true;
    }

    let isOpen = open
      ? open.trim() === 'true'
      : '';
    if (isOpen !== '' && isOpen !== issue.open) {
      issue.open = !issue.open;
      changeFlag = true;
    }

    if (!changeFlag) {

      return {
        error: 'no update field(s) sent',
        _id: id,
      };
    }

    issue.updated_on = new Date();

    const updatePayload = {
      $set: issue,
    };

    await updateIssue({ _id: id }, updatePayload);

    return {
      _id,
      result: 'successfully updated',
    };
  } catch (err) {
    console.error('updateIssueService error: ', err);

    return {
      status: 500,
    };
  }
}

exports.deleteIssueService = async (projectName, body) => {
  try {
    if (!body._id) {

      return {
        error: 'missing _id',
      }
    }

    if (!typeof body._id === 'string') {

      return {
        error: 'could not delete',
        _id: body._id,
      }
    }

    let id = body._id.trim();

    if (!ObjectId.isValid(id)) {

      return {
        error: 'could not delete',
        _id: id,
      }
    }

    id = new ObjectId(id);
    const issue = await findOneIssue({ _id: id }, { projection: { _id: 2 } });

    if (!issue) {

      return {
        error: 'could not delete',
        _id: id.toString(),
      }
    }

    const project = await findOneProjectService(projectName);
    if (project && project.issues.length) {
      let issuesCopy = project.issues.slice();
      const index = issuesCopy.findIndex((issue) => issue.toString() === id.toString());
      if (index >= 0) {
        issuesCopy.splice(index, 1);
        const update = {
          $set: {
            issues: issuesCopy,
            updated_on: new Date(),
          },
        };

        await updateOneProject({ _id: project._id }, update);
      }
    }

    const result = await deleteIssue({ _id: id });
    if (!result.acknowledged) {

      return {
        error: 'could not delete',
        _id: id.toString(),
      }
    };

    return {
      result: 'successfully deleted',
      _id: id.toString(),
    }
  } catch (err) {
    console.error('deleteIssueService error: ', err);

    return {
      error: 'could not delete',
      _id: body._id ? body._id : '',
    };
  }
}
