const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
} = require("../services/leadService");

const create = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    if (!name || !email || !phone || !company) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and company are required",
      });
    }

    const lead = await createLead(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create lead",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const leads = await getLeads(req.user);

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

const getOne = async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Lead not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
    });
  }
};

const update = async (req, res) => {
  try {
    const lead = await updateLead(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Lead not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update lead",
    });
  }
};

const remove = async (req, res) => {
  try {
    await deleteLead(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Lead not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete lead",
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

    const lead = await assignLead(
      req.params.id,
      assignedTo,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      lead,
    });
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message === "Assigned user not found" ||
      error.message.includes("not authorized") ||
      error.message.includes("only be assigned")
    ) {
      return res.status(
        error.message === "Lead not found" ||
        error.message === "Assigned user not found"
          ? 404
          : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Assign lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign lead",
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