import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No valid token provided.' 
      });
    }
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const employee = await Employee.findById(decoded.employeeId).select('-password');
    
    if (!employee || !employee.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid or employee is inactive.' 
      });
    }
    
    // Add employee to request object
    req.employee = employee;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid.' 
    });
  }
};

// Middleware to check if user is HR or manager
export const authorizeHR = (req, res, next) => {
  if (req.employee.role !== 'hr' && req.employee.role !== 'manager') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. HR or Manager role required.' 
    });
  }
  next();
};

// Middleware to check if user is admin (HR only)
export const authorizeAdmin = (req, res, next) => {
  if (req.employee.role !== 'hr') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. HR role required.' 
    });
  }
  next();
};