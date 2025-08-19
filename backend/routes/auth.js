import express from "express";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new employee (self-signup as employee)
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, joiningDate } = req.body;

    if (!name || !email || !password || !department || !joiningDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, password, department, joiningDate",
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // If no HR exists yet, make this user HR (bootstrapping the system)
    const hrExists = await Employee.exists({ role: "hr" });

    // Create employee (default role employee unless first HR)
    const employee = new Employee({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department,
      joiningDate: new Date(joiningDate),
      role: hrExists ? "employee" : "hr",
    });

    await employee.save();

    // Create JWT payload
    const payload = {
      employeeId: employee._id,
      email: employee.email,
      role: employee.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
        joiningDate: employee.joiningDate,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login employee
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ email, isActive: true });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT payload
    const payload = {
      employeeId: employee._id,
      email: employee.email,
      role: employee.role,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in employee
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id).select(
      "-password"
    );
    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        leaveBalance: employee.leaveBalance,
        joiningDate: employee.joiningDate,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
