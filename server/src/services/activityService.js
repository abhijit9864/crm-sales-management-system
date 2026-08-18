const Activity = require("../models/Activity");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Deal = require("../models/Deal");
const User = require("../models/User");

const createActivity = async (activityData, user) => {
  const {
    assignedTo,
    lead,
    customer,
    deal,
  } = activityData;

  // Only Admin and Sales Manager can assign
  // activities to another user.
  let activityAssignedTo = user._id;

  if (assignedTo) {
    if (
      user.role !== "ADMIN" &&
      user.role !== "SALES_MANAGER"
    ) {
      throw new Error(
        "You are not authorized to assign activities"
      );
    }

    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
      throw new Error("Assigned user not found");
    }

    if (assignedUser.role !== "SALES_EXECUTIVE") {
      throw new Error(
        "Activities can only be assigned to Sales Executives"
      );
    }

    activityAssignedTo = assignedUser._id;
  }

  // Validate linked Lead.
  if (lead) {
    const existingLead = await Lead.findById(lead);

    if (!existingLead) {
      throw new Error("Lead not found");
    }
  }

  // Validate linked Customer.
  if (customer) {
    const existingCustomer = await Customer.findById(customer);

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }
  }

  // Validate linked Deal.
  if (deal) {
    const existingDeal = await Deal.findById(deal);

    if (!existingDeal) {
      throw new Error("Deal not found");
    }
  }

  const activity = await Activity.create({
    ...activityData,
    assignedTo: activityAssignedTo,
    createdBy: user._id,
  });

  return Activity.findById(activity._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("lead", "name email company")
    .populate("customer", "name email company")
    .populate("deal", "title value stage");
};

const getActivities = async (user) => {
  const filter = {};

  // Sales Executives see only their activities.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  }

  return Activity.find(filter)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("lead", "name email company")
    .populate("customer", "name email company")
    .populate("deal", "title value stage")
    .sort({ dueDate: 1, createdAt: -1 });
};

const getActivityById = async (activityId, user) => {
  const activity = await Activity.findById(activityId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("lead", "name email company")
    .populate("customer", "name email company")
    .populate("deal", "title value stage");

  if (!activity) {
    throw new Error("Activity not found");
  }

  if (
    user.role === "SALES_EXECUTIVE" &&
    activity.assignedTo._id.toString() !== user._id.toString()
  ) {
    throw new Error(
      "You are not authorized to access this activity"
    );
  }

  return activity;
};

const updateActivity = async (
  activityId,
  updateData,
  user
) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new Error("Activity not found");
  }

  if (
    user.role === "SALES_EXECUTIVE" &&
    activity.assignedTo.toString() !== user._id.toString()
  ) {
    throw new Error(
      "You are not authorized to update this activity"
    );
  }

  // Sales Executives cannot change ownership.
  if (user.role === "SALES_EXECUTIVE") {
    delete updateData.assignedTo;
  }

  // Never allow changing the creator.
  delete updateData.createdBy;

  Object.assign(activity, updateData);

  await activity.save();

  return Activity.findById(activity._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("lead", "name email company")
    .populate("customer", "name email company")
    .populate("deal", "title value stage");
};

const deleteActivity = async (activityId, user) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new Error("Activity not found");
  }

  if (user.role !== "ADMIN") {
    throw new Error(
      "You are not authorized to delete this activity"
    );
  }

  await activity.deleteOne();

  return activity;
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
};