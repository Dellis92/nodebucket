/**
 * DeVonte Ellis'
 * 06-20-2024
 */

"use strict";

const express = require("express");
const { mongo } = require("../utils/mongo");
const createError = require("http-errors");
const { ObjectId } = require("mongodb");

const Ajv = require('ajv');
const ajv = new Ajv(); //create new instance of the Ajv object from the npm package

const router = express.Router();

//Base: http://localhost:3000/api/employees/:empId
//Valid: http://localhost:3000/api/employees/1007
//Invalid: http://localhost:3000/api/employees/foo
//Invalid: http://localhost:3000/api/employees/9999
router.get("/:empId/tasks", (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);
    //Error above? check to make sure syntax is correct
    console.log()

    //checking to see if the returned value from parseInt is NaN
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "input must be a number"));
    }

    //database query is handled
    mongo(async db => {
      const employee = await db.collection("employees").findOne({ empId });

      if (!employee) {
        console.error("Employee not found:", empId);
        return next(createError(404, "Employee not found"));
      }
      res.send(employee);
    }, next)
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
});

module.exports = router;

/**
 * findAllTasks API
 * @returns JSON array of all tasks
 * @throws { 500 error } - if there is a server error
 * @throws { 400 error } - if the employee id is not a number
 * @throws { 404 error } - if no tasks are found
 */

router.get('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);
    //error above? checking syntax
    console.log()

    //Check to determine if the returned value from parseInt is NaN
    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'));
    }

    //Call our mongo module and return a list of tasks by employee ID
    mongo(async db => {
      const tasks = await db.collection('employees').findOne( { empId: empId}, { projection: { empId: 1, todo: 1, done: 1 } } );

      console.log('tasks', tasks);

      //If there are no tasks found for the employee ID: return a 404 error object to our middleware error handler
      if (!tasks) {
        return next(createError(404, 'Tasks not found for employee ID ${empId}'));
      }

      res.send(tasks);
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

/**
 * Create Task API
 */
const testSchema = {
  type: 'object',
  properties: {
    text: {type: 'string'}
  },
  required: ['text'],
  additionalProperties: false
};

router.post('/:empId/tasks', (req, res, next) => {
  try {
    //Check to see if the empId from the req params is a number
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    //Check to see if the parseInt function returns a number of NaN; If NaN, then it means the empID is not a number
    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'))
    }

    mongo (async db => {
      const employee = await db.collection('employees').findOne( { empId: empId} );

      //If the employee is not found, return a 404 error
      if (!employee) {
        return next(createError(404, 'Employee not found with empId', empId));
      }

      const validator = ajv.compile(taskSchema);
      const valid = validator( req.body )

      //if the payload is not valid return a 400 error and append the errors to the err.errors property
      if (!valid) {
        return next(createError(400, 'Invalid task payload', validator.errors))
      }

      //Create the object literal to add to the employee collection
      const newTask = {
        _id: new ObjectId(),
        text: req.body.text
      }

      //call the mongo module and update the employee collection with the new tas in the todo column
      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $push: {todo: newTask}
      })

      //check to see if the modified count is updated; if so then the task was added to the employee field
      if (!result.modifiedCount) {
        return next(createError(400, 'Unable to create task'));
      }

      res.status(201).send( { id: newTask._id });
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
      }
    }
  }
};

//Update task API
router.put('/:empId/tasks', (req, res, next) =>{
  try {

    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'))
    }

    mongo(async db => {
      const employee = await db.collection('employees').findOne( { empId: empId } );
      if (!employee) {
        return next (createError(404, `Employee not found with empId ${empId}`));
      }
      const tasks = req.body;
      const validator = ajv.compile(tasksSchema);
      const valid = validator(tasks);
      if(!valid) {
        return next(createError(400,'Invalid task payload', validator.errors));
      }
      const result = await db.collection ('employees').updateOne(
        { empId: empId },
        { $set: {todo: tasks.todo, done: tasks.done }}
      )
      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});



//Delete Task API
router.delete('/:empId/tasks/:taskId', (req, res, next) =>{
  try {
    let { empId } = req.params;
    let { taskId } = req.params;

    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'));
    }

    mongo(async db => {
      let emp = await db.collection('employees').findOne({ empId: empId });

      if (!emp) {
        return next(createError(404, `Employee not found with empId ${empId}`));
      }

      if (!emp.todo) emp.todo = [];
      if (!emp.done) emp.done = [];

      const todo = emp.todo.filter(t => t._id.toString() !==taskId.toString());
      const done = emp.done.filter(t => t._id.toString() !==taskId.toString());

      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $set: { todo: todo, done: done }}
      )

      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

module.exports = router // end.module.exports = router



//check to see if tests are connecting to port 3000
/**
 * app.listen(3000, ()=>{
 * console.log('Nodebucket is running on port 3000')
 * })
 */