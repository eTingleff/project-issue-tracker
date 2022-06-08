'use strict';

const { findOneProject } = require('./project_dao');

exports.findOneProjectService = async (projectName) => {
  try {
    const name = projectName.trim();
    if (!name) {

      return {
        status: 400,
      };
    }

    const project = await findOneProject({ name });

    return project;
  } catch (err) {
    console.error('findOneProjectService error: ', err);

    return {
      status: 500,
    };
  }
}
