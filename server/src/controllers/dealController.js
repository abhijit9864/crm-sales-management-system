const {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal,
  assignDeal,
} = require("../services/dealService");

const create = async (req, res) => {
  try {
    const { title, customer, value } = req.body;

    if (!title || !customer || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, customer and value are required",
      });
    }

    const deal = await createDeal(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal,
    });
  } catch (error) {
    if (error.message === "Customer not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create deal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create deal",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const deals = await getDeals(req.user);

    return res.status(200).json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error) {
    console.error("Get deals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deals",
    });
  }
};

const getOne = async (req, res) => {
  try {
    const deal = await getDealById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      deal,
    });
  } catch (error) {
    if (
      error.message === "Deal not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Deal not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get deal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deal",
    });
  }
};

// const update = async (req, res) => {
//   try {
//     const deal = await updateDeal(
//       req.params.id,
//       req.body,
//       req.user
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Deal updated successfully",
//       deal,
//     });
//   } catch (error) {
//     if (
//       error.message === "Deal not found" ||
//       error.message.includes("not authorized")
//     ) {
//       return res.status(
//         error.message === "Deal not found" ? 404 : 403
//       ).json({
//         success: false,
//         message: error.message,
//       });
//     }

//     console.error("Update deal error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update deal",
//     });
//   }
// };


const update = async (req, res) => {
  try {
    const deal = await updateDeal(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      deal,
    });
  } catch (error) {
    if (error.message === "Deal not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not authorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    console.error("Update deal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update deal",
    });
  }
};


const remove = async (req, res) => {
  try {
    await deleteDeal(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    if (
      error.message === "Deal not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Deal not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete deal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete deal",
    });
  }
};

const assign = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "assignedTo is required",
      });
    }

    const deal = await assignDeal(
      req.params.id,
      assignedTo,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Deal assigned successfully",
      deal,
    });
  } catch (error) {
    if (
      error.message === "Deal not found" ||
      error.message === "Assigned user not found" ||
      error.message.includes("not authorized") ||
      error.message.includes("only be assigned")
    ) {
      return res.status(
        error.message === "Deal not found" ||
        error.message === "Assigned user not found"
          ? 404
          : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Assign deal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign deal",
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  assign,
};