const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(user);
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
