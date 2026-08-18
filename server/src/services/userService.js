const User = require("../models/User");

const getUsers = async () => {
  return User.find()
    .select("-password")
    .sort({ createdAt: -1 });
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent password changes through user management.
  delete updateData.password;

  // Prevent changing the user's ID.
  delete updateData._id;

  Object.assign(user, updateData);

  await user.save();

  return User.findById(user._id).select("-password");
};

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = isActive;

  await user.save();

  return User.findById(user._id).select("-password");
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};