import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import { authenticate, authorizeHR } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/leaves/apply
// @desc    Apply for leave
// @access  Private
router.post('/apply', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    
    // Validate required fields
    if (!startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: startDate, endDate, leaveType, reason'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    // Validate dates
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave on past dates'
      });
    }
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after or equal to start date'
      });
    }
    
    // Check if applying for leave before joining date
    if (start < req.employee.joiningDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave before joining date'
      });
    }
    
    // Create temporary leave request to calculate working days
    const tempLeaveRequest = new LeaveRequest({
      employee: req.employee._id,
      startDate: start,
      endDate: end,
      leaveType,
      reason
    });
    
    const workingDays = tempLeaveRequest.calculateWorkingDays();
    
    if (workingDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Leave request must include at least one working day'
      });
    }
    
    // Check current leave balance
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    
    const approvedLeaves = await LeaveRequest.aggregate([
      {
        $match: {
          employee: req.employee._id,
          status: 'approved',
          startDate: { $gte: yearStart, $lte: yearEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);
    
    const usedLeaves = approvedLeaves.length > 0 ? approvedLeaves[0].totalDays : 0;
    const availableLeaves = req.employee.leaveBalance - usedLeaves;
    
    if (workingDays > availableLeaves) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. You have ${availableLeaves} days available, but requested ${workingDays} days.`
      });
    }
    
    // Check for overlapping leave requests
    const hasOverlapping = await LeaveRequest.hasOverlappingLeave(
      req.employee._id,
      start,
      end
    );
    
    if (hasOverlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved leave request that overlaps with these dates'
      });
    }
    
    // Create leave request
    const leaveRequest = new LeaveRequest({
      employee: req.employee._id,
      startDate: start,
      endDate: end,
      leaveType,
      reason: reason.trim(),
      totalDays: workingDays
    });
    
    await leaveRequest.save();
    
    // Populate employee details for response
    await leaveRequest.populate('employee', 'name email department');
    
    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leaveRequest
    });
    
  } catch (error) {
    console.error('Apply leave error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while applying for leave'
    });
  }
});

// @route   GET /api/leaves/requests
// @desc    Get all leave requests (for HR)
// @access  Private (HR only)
router.get('/requests', authenticate, authorizeHR, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get leave requests with pagination
    const leaveRequests = await LeaveRequest.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await LeaveRequest.countDocuments(query);
    
    res.json({
      success: true,
      leaveRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave requests'
    });
  }
});

// @route   GET /api/leaves/my-requests
// @desc    Get current employee's leave requests
// @access  Private
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ employee: req.employee._id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      leaveRequests
    });
    
  } catch (error) {
    console.error('Get my leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your leave requests'
    });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request
// @access  Private (HR only)
router.put('/:id/approve', authenticate, authorizeHR, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('employee', 'name email department leaveBalance');
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leaveRequest.status}`
      });
    }
    
    // Double-check leave balance before approval
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    
    const approvedLeaves = await LeaveRequest.aggregate([
      {
        $match: {
          employee: leaveRequest.employee._id,
          status: 'approved',
          startDate: { $gte: yearStart, $lte: yearEnd },
          _id: { $ne: leaveRequest._id } // Exclude current request
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);
    
    const usedLeaves = approvedLeaves.length > 0 ? approvedLeaves[0].totalDays : 0;
    const availableLeaves = leaveRequest.employee.leaveBalance - usedLeaves;
    
    if (leaveRequest.totalDays > availableLeaves) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve. Employee has only ${availableLeaves} days available, but request is for ${leaveRequest.totalDays} days.`
      });
    }
    
    // Update leave request
    leaveRequest.status = 'approved';
    leaveRequest.reviewedBy = req.employee._id;
    leaveRequest.reviewedAt = new Date();
    if (comment) {
      leaveRequest.reviewComment = comment.trim();
    }
    
    await leaveRequest.save();
    
    // Populate for response
    await leaveRequest.populate('reviewedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Leave request approved successfully',
      leaveRequest
    });
    
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving leave request'
    });
  }
});

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request
// @access  Private (HR only)
router.put('/:id/reject', authenticate, authorizeHR, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    // Validate rejection comment
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection comment is required'
      });
    }
    
    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('employee', 'name email department');
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leaveRequest.status}`
      });
    }
    
    // Update leave request
    leaveRequest.status = 'rejected';
    leaveRequest.reviewedBy = req.employee._id;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.reviewComment = comment.trim();
    
    await leaveRequest.save();
    
    // Populate for response
    await leaveRequest.populate('reviewedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Leave request rejected successfully',
      leaveRequest
    });
    
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting leave request'
    });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Cancel leave request (only if pending)
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    // Check if user owns this leave request or is HR
    if (leaveRequest.employee.toString() !== req.employee._id.toString() && req.employee.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own leave requests'
      });
    }
    
    // Can only cancel pending requests
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${leaveRequest.status} leave request`
      });
    }
    
    await LeaveRequest.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling leave request'
    });
  }
});

export default router;