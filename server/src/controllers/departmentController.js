// req/res handling only — no Mongoose, no business rules. Each handler's
// job is: pull input out of req, call the service, shape the response.
const departmentService = require('../services/departmentService');
const asyncHandler = require('../utils/asyncHandler');

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.listDepartments();
  res.json(departments);
});

const getDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartment(req.params.id);
  res.json(department);
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  res.status(201).json(department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  res.json(department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);
  res.status(204).send();
});

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
