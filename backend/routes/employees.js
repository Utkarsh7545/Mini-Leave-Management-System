import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/employees
// @desc    Add a new employee
// @access  Private (HR only)
router.post("/", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, password, department, joiningDate, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department || !joiningDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, password, department, joiningDate",
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Validate joining date
    const joining = new Date(joiningDate);
    if (joining > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Joining date cannot be in the future",
      });
    }

    // Create new employee
    const employee = new Employee({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department,
      joiningDate: joining,
      role: role || "employee",
    });

    await employee.save();

    // Return employee without password
    const employeeData = employee.toObject();
    delete employeeData.password;

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: employeeData,
    });
  } catch (error) {
    console.error("Add employee error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while adding employee",
    });
  }
});

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private (HR only)
router.get("/", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employees",
    });
  }
});

// @route   GET /api/employees/:id/balance
// @desc    Get leave balance for an employee
// @access  Private
router.get("/:id/balance", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const effectiveId = id === "me" ? req.employee._id.toString() : id;

    if (!effectiveId || !mongoose.Types.ObjectId.isValid(effectiveId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee id",
      });
    }

    // Allow employees to see their own balance, HR can see anyone's
    if (
      req.employee.role !== "hr" &&
      req.employee._id.toString() !== effectiveId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own leave balance",
      });
    }

    // Find employee
    const employee = await Employee.findById(effectiveId).select("-password");
    if (!employee || !employee.isActive) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get total approved leaves for current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const approvedLeaves = await LeaveRequest.aggregate([
      {
        $match: {
          employee: employee._id,
          status: "approved",
          startDate: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$totalDays" },
        },
      },
    ]);

    const usedLeaves =
      approvedLeaves.length > 0 ? approvedLeaves[0].totalDays : 0;
    const availableLeaves = Math.max(0, employee.leaveBalance - usedLeaves);

    res.json({
      success: true,
      leaveBalance: {
        total: employee.leaveBalance,
        used: usedLeaves,
        available: availableLeaves,
        employee: {
          id: employee._id,
          name: employee.name,
          department: employee.department,
          joiningDate: employee.joiningDate,
        },
      },
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching leave balance",
    });
  }
});

// @route   GET /api/employees/:id/leaves
// @desc    Get leave history for an employee
// @access  Private
router.get("/:id/leaves", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const effectiveId = id === "me" ? req.employee._id.toString() : id;

    if (!effectiveId || !mongoose.Types.ObjectId.isValid(effectiveId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee id",
      });
    }

    // Allow employees to see their own leaves, HR can see anyone's
    if (
      req.employee.role !== "hr" &&
      req.employee._id.toString() !== effectiveId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own leave history",
      });
    }

    const leaves = await LeaveRequest.find({ employee: effectiveId })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error("Get employee leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching leave history",
    });
  }
});

export default router;
