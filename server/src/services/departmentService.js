// Business rules live here. Week 1 has none yet beyond "it must exist to
// be read/updated/deleted" — Week 2 will add rules like "a department
// can't be deleted while it owns open tasks" without controllers or
// repositories needing to change.
const departmentRepository = require('../repositories/departmentRepository');
const { NotFoundError } = require('../utils/errors');

async function listDepartments() {
  return departmentRepository.findAll();
}

async function getDepartment(id) {
  const department = await departmentRepository.findById(id);
  if (!department) throw new NotFoundError(`Department ${id} not found`);
  return department;
}

async function createDepartment(data) {
  return departmentRepository.create(data);
}

async function updateDepartment(id, data) {
  const department = await departmentRepository.updateById(id, data);
  if (!department) throw new NotFoundError(`Department ${id} not found`);
  return department;
}

async function deleteDepartment(id) {
  const department = await departmentRepository.deleteById(id);
  if (!department) throw new NotFoundError(`Department ${id} not found`);
  return department;
}

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
