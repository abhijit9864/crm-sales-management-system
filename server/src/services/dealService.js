const Deal = require("../models/Deal");
const Customer = require("../models/Customer");

const createDeal = async (dealData, userId) => {
  const customer = await Customer.findById(dealData.customer);

  if (!customer) {
    throw new Error("Customer not found");
  }

  const deal = await Deal.create({
    ...dealData,
    createdBy: userId,
  });

  return Deal.findById(deal._id)
    .populate("customer", "name email company")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

const getDeals = async (user) => {
  const filter = {};

  // Sales Executives can only see their assigned deals.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  }

  return Deal.find(filter)
    .populate("customer", "name email company")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
};

const getDealById = async (dealId, user) => {
  const deal = await Deal.findById(dealId)
    .populate("customer", "name email company")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  if (!deal) {
    throw new Error("Deal not found");
  }

  if (
    user.role === "SALES_EXECUTIVE" &&
    (!deal.assignedTo ||
      deal.assignedTo._id.toString() !== user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to access this deal"
    );
  }

  return deal;
};

const updateDeal = async (dealId, updateData, user) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new Error("Deal not found");
  }

  if (
    user.role === "SALES_EXECUTIVE" &&
    (!deal.assignedTo ||
      deal.assignedTo.toString() !== user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to update this deal"
    );
  }

  // Sales Executives cannot change ownership.
  if (user.role === "SALES_EXECUTIVE") {
    delete updateData.assignedTo;
  }

  // Don't allow changing the creator.
  delete updateData.createdBy;

  Object.assign(deal, updateData);

  await deal.save();

  return Deal.findById(deal._id)
    .populate("customer", "name email company")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

const deleteDeal = async (dealId, user) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new Error("Deal not found");
  }

  // Only Admin can delete deals.
  if (user.role !== "ADMIN") {
    throw new Error(
      "You are not authorized to delete this deal"
    );
  }

  await deal.deleteOne();

  return deal;
};

const assignDeal = async (dealId, assignedTo, user) => {
  const deal = await Deal.findById(dealId);

  if (!deal) {
    throw new Error("Deal not found");
  }

  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to assign deals"
    );
  }

  const User = require("../models/User");

  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    throw new Error("Assigned user not found");
  }

  if (assignedUser.role !== "SALES_EXECUTIVE") {
    throw new Error(
      "Deals can only be assigned to Sales Executives"
    );
  }

  deal.assignedTo = assignedUser._id;

  await deal.save();

  return Deal.findById(deal._id)
    .populate("customer", "name email company")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

module.exports = {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal,
  assignDeal,
};