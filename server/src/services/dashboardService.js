const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Deal = require("../models/Deal");
const Activity = require("../models/Activity");

// const getDashboardStats = async (user) => {
//   const isExecutive = user.role === "SALES_EXECUTIVE";

//   const leadFilter = isExecutive
//     ? { assignedTo: user._id }
//     : {};

//   const customerFilter = isExecutive
//     ? { assignedTo: user._id }
//     : {};

//   const dealFilter = isExecutive
//     ? { assignedTo: user._id }
//     : {};

//   const activityFilter = isExecutive
//     ? { assignedTo: user._id }
//     : {};

//   const [
//     totalLeads,
//     totalCustomers,
//     totalDeals,
//     pipeline,
//     activities,
//   ] = await Promise.all([
//     Lead.countDocuments(leadFilter),

//     Customer.countDocuments(customerFilter),

//     Deal.countDocuments(dealFilter),

//     Deal.aggregate([
//       { $match: dealFilter },
//       {
//         $group: {
//           _id: "$stage",
//           totalValue: { $sum: "$value" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $sort: {
//           totalValue: -1,
//         },
//       },
//     ]),

//     Activity.aggregate([
//       { $match: activityFilter },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]),
//   ]);

//   const pipelineValue = pipeline.reduce(
//     (total, item) => total + item.totalValue,
//     0
//   );

//   const activityStats = {
//     Pending: 0,
//     Completed: 0,
//     Cancelled: 0,
//   };

//   activities.forEach((item) => {
//     activityStats[item._id] = item.count;
//   });

//   const wonDeals = pipeline.find(
//     (item) => item._id === "Closed Won"
//   );

//   const lostDeals = pipeline.find(
//     (item) => item._id === "Closed Lost"
//   );

//   return {
//     totals: {
//       leads: totalLeads,
//       customers: totalCustomers,
//       deals: totalDeals,
//     },

//     pipeline: {
//       totalValue: pipelineValue,
//       stages: pipeline,
//       wonValue: wonDeals?.totalValue || 0,
//       wonCount: wonDeals?.count || 0,
//       lostValue: lostDeals?.totalValue || 0,
//       lostCount: lostDeals?.count || 0,
//     },

//     activities: activityStats,
//   };
// };

const getDashboardStats = async (user) => {
  const isExecutive = user.role === "SALES_EXECUTIVE";

  const leadFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const customerFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const dealFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const activityFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const [
    totalLeads,
    totalCustomers,
    totalDeals,
    pipeline,
    activities,
    recentActivities,
    upcomingActivities,
  ] = await Promise.all([
    Lead.countDocuments(leadFilter),

    Customer.countDocuments(customerFilter),

    Deal.countDocuments(dealFilter),

    Deal.aggregate([
      { $match: dealFilter },
      {
        $group: {
          _id: "$stage",
          totalValue: { $sum: "$value" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalValue: -1,
        },
      },
    ]),

    Activity.aggregate([
      { $match: activityFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    Activity.find(activityFilter)
      .populate("assignedTo", "name email role")
      .populate("customer", "name email company")
      .populate("deal", "title value stage")
      .sort({ createdAt: -1 })
      .limit(5),

    Activity.find({
      ...activityFilter,
      status: "Pending",
      dueDate: {
        $gte: new Date(),
      },
    })
      .populate("assignedTo", "name email role")
      .populate("customer", "name email company")
      .populate("deal", "title value stage")
      .sort({ dueDate: 1 })
      .limit(5),
  ]);

  const pipelineValue = pipeline.reduce(
    (total, item) => total + item.totalValue,
    0
  );

  const activityStats = {
    Pending: 0,
    Completed: 0,
    Cancelled: 0,
  };

  activities.forEach((item) => {
    activityStats[item._id] = item.count;
  });

  const wonDeals = pipeline.find(
    (item) => item._id === "Closed Won"
  );

  const lostDeals = pipeline.find(
    (item) => item._id === "Closed Lost"
  );

  return {
    totals: {
      leads: totalLeads,
      customers: totalCustomers,
      deals: totalDeals,
    },

    pipeline: {
      totalValue: pipelineValue,
      stages: pipeline,
      wonValue: wonDeals?.totalValue || 0,
      wonCount: wonDeals?.count || 0,
      lostValue: lostDeals?.totalValue || 0,
      lostCount: lostDeals?.count || 0,
    },

    activities: {
      stats: activityStats,
      recent: recentActivities,
      upcoming: upcomingActivities,
    },
  };
};

module.exports = {
  getDashboardStats,
};