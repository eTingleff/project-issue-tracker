const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let deleteId;

suite('Functional Tests', () => {

  suite('POST request to /api/issues/{project}', () => {

    test('Create an issue with every field', (done) => {
      chai.request(server)
        .post('/api/issues/api-post-delete-test')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue',
          created_by: 'Creator',
          assigned_to: 'Assignee',
          status_text: 'Open',
        })
        .end((err, res) => {
          assert.hasAllKeys(res.body, [
            '_id',
            'project_id',
            'issue_title',
            'issue_text',
            'created_by',
            'assigned_to',
            'status_text',
            'open',
            'created_on',
            'updated_on',
          ]);
          deleteId = res.body._id;

          done();
        });
    });

    test('Create an issue with only required fields', (done) => {
      chai.request(server)
        .post('/api/issues/api-post-delete-test')
        .send({
          issue_title: 'Title',
          issue_text: 'Text',
          created_by: 'Creator'
        })
        .end((err, res) => {
          assert.hasAllKeys(res.body, [
            '_id',
            'project_id',
            'issue_title',
            'issue_text',
            'created_by',
            'assigned_to',
            'status_text',
            'open',
            'created_on',
            'updated_on',
          ]);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'Text');
          assert.equal(res.body.created_by, 'Creator');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');

          done();
        });
    });

    test('Create an issue with missing required fields', (done) => {
      chai.request(server)
        .post('/api/issues/api-post-delete-test')
        .send({
          issue_title: 'Title',
        })
        .end((err, res) => {
          assert.equal(res.body.error, 'required field(s) missing');

          done();
        });
    });
  });

  suite('GET request to /api/issues/{project}', (done) => {
    test('View issues on a project', (done) => {
      chai.request(server)
        .get('/api/issues/api-get-test')
        .end((err, res) => {
          assert.isTrue(Array.isArray(res.body));
          res.body.forEach((issue) => {
            assert.hasAllKeys(issue, [
              '_id',
              'project_id',
              'issue_title',
              'issue_text',
              'created_by',
              'assigned_to',
              'status_text',
              'open',
              'created_on',
              'updated_on',
            ]);
          });

          done();
        });
    });

    test('View issues on a project with one filter', (done) => {
      chai.request(server)
        .get('/api/issues/api-get-test')
        .query({ open: false })
        .end((err, res) => {
          assert.isTrue(Array.isArray(res.body));
          res.body.forEach((issue) => {
            assert.isFalse(issue.open);
          });

          done();
        });
    });

    test('View issues on a project with multiple filters', (done) => {
      chai.request(server)
        .get('/api/issues/api-get-test')
        .query({ status_text: 'IN_PROGRESS', assigned_to: 'some_dev' })
        .end((err, res) => {
          assert.isTrue(Array.isArray(res.body));
          res.body.forEach((issue) => {
            assert.equal(issue.status_text, 'IN_PROGRESS');
            assert.equal(issue.assigned_to, 'some_dev');
          });

          done();
        });
    });
  });

  suite('PUT request to /api/issues/{project}', () => {

    test('Update one field on an issue', (done) => {
      chai.request(server)
        .put('/api/issues/api-put-test')
        .send({
          _id: '629ec15b6e9e354928380b09',
          issue_text: `This text was last changed on ${new Date()}`,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: 'successfully updated',
            _id: '629ec15b6e9e354928380b09',
          });

          done();
        });
    });

    test('Update multiple fields on an issue', (done) => {
      chai.request(server)
        .put('/api/issues/api-put-test')
        .send({
          _id: '629ec15b6e9e354928380b09',
          issue_title: `${Date.now()}`,
          issue_text: `This text was last changed on ${new Date()}`,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: 'successfully updated',
            _id: '629ec15b6e9e354928380b09',
          });

          done();
        });
    });

    test('Update an issue with missing _id', (done) => {
      chai.request(server)
        .put('/api/issues/api-put-test')
        .send({
          issue_text: 'Text',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: 'missing _id',
          });

          done();
        });
    });

    test('Update an issue with no fields to update', (done) => {
      chai.request(server)
        .put('/api/issues/api-put-test')
        .send({
          _id: '629ec15b6e9e354928380b09',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: 'no update field(s) sent',
            _id: '629ec15b6e9e354928380b09',
          });

          done();
        });
    });

    test('Update an issue with an invalid _id', (done) => {
      chai.request(server)
        .put('/api/issues/api-put-test')
        .send({
          _id: 'invalid_id',
          assigned_to: 'Bob',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: 'could not update',
            _id: 'invalid_id',
          });

          done();
        });
    });
  });

  suite('DELETE request to /api/issues/{project}', () => {
    test('Delete an issue', (done) => {
      chai.request(server)
        .delete('/api/issues/api-post-delete-test')
        .send({ _id: deleteId })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: 'successfully deleted',
            _id: deleteId,
          });

          done();
        });
    });

    test('Delete an issue with an invalid _id', (done) => {
      chai.request(server)
        .delete('/api/issues/api-post-delete-test')
        .send({ _id: 'invalid_id' })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: 'could not delete',
            _id: 'invalid_id',
          });

          done();
        });
    });

    test('Delete an issue with missing _id', (done) => {
      chai.request(server)
        .delete('/api/issues/api-post-delete-test')
        .send({})
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: 'missing _id',
          });

          done();
        });
    });
  });
});
