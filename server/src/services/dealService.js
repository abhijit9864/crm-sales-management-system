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

// const getDeals = async (user) => {
//   const filter = {};

//   // Sales Executives can only see their assigned deals.
//   if (user.role === "SALES_EXECUTIVE") {
//     filter.assignedTo = user._id;
//   }

//   return Deal.find(filter)
//     .populate("customer", "name email company")
//     .populate("assignedTo", "name email role")
//     .populate("createdBy", "name email role")
//     .sort({ createdAt: -1 });
// };


const getDeals = async (user, query = {}) => {
  const {
    search,
    stage,
    assignedTo,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Sales Executives can only see their assigned deals.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  // Filter by deal stage.
  if (stage) {
    filter.stage = stage;
  }

  // Search by deal title.
  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter.title = searchRegex;
  }

  const currentPage = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * currentLimit;

  const [deals, total] = await Promise.all([
    Deal.find(filter)
      .populate("customer", "name email company")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Deal.countDocuments(filter),
  ]);

  return {
    deals,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
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

  // Sales Executives can only update their assigned deals.
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

  // Closed deals cannot be moved to another stage.
  if (
    (deal.stage === "Closed Won" ||
      deal.stage === "Closed Lost") &&
    updateData.stage &&
    updateData.stage !== deal.stage
  ) {
    throw new Error(
      "Closed deals cannot be moved to another stage"
    );
  }

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