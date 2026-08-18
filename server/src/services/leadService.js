const Lead = require("../models/Lead");

const createLead = async (leadData, userId) => {
  const lead = await Lead.create({
    ...leadData,
    createdBy: userId,
  });

  return lead;
};

const getLeads = async (user) => {
  const filter = {};

  // Sales Executives can only see their own leads.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  }

  return Lead.find(filter)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
};

const getLeadById = async (leadId, user) => {
  const lead = await Lead.findById(leadId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Sales Executives can only access their assigned leads.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!lead.assignedTo ||
      lead.assignedTo._id.toString() !== user._id.toString())
  ) {
    throw new Error("You are not authorized to access this lead");
  }

  return lead;
};

const updateLead = async (leadId, updateData, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Sales Executives can only update their own leads.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!lead.assignedTo ||
      lead.assignedTo.toString() !== user._id.toString())
  ) {
    throw new Error("You are not authorized to update this lead");
  }

  // Sales Executives cannot change ownership.
  if (user.role === "SALES_EXECUTIVE") {
    delete updateData.assignedTo;
  }

  Object.assign(lead, updateData);

  await lead.save();

  return lead;
};

const deleteLead = async (leadId, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Only Admin can delete leads.
  if (user.role !== "ADMIN") {
    throw new Error("You are not authorized to delete this lead");
  }

  await lead.deleteOne();

  return lead;
};

const assignLead = async (leadId, assignedTo, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to assign leads"
    );
  }

  const User = require("../models/User");

  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    throw new Error("Assigned user not found");
  }

  if (assignedUser.role !== "SALES_EXECUTIVE") {
    throw new Error(
      "Leads can only be assigned to Sales Executives"
    );
  }

  lead.assignedTo = assignedUser._id;

  await lead.save();

  return Lead.findById(lead._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
};