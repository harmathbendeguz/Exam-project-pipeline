const userRepository = require('../repositories/userRepository');
const { NotFoundError } = require('../utils/errors');

async function listUsers() {
  return userRepository.findAll();
}

async function getUser(id) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError(`User ${id} not found`);
  return user;
}

async function createUser(data) {
  return userRepository.create(data);
}

async function updateUser(id, data) {
  const user = await userRepository.updateById(id, data);
  if (!user) throw new NotFoundError(`User ${id} not found`);
  return user;
}

async function deleteUser(id) {
  const user = await userRepository.deleteById(id);
  if (!user) throw new NotFoundError(`User ${id} not found`);
  return user;
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
