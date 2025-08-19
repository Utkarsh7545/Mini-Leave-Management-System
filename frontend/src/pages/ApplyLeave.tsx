import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { LeaveApplicationForm, LeaveBalance } from "../types";
import api, { handleApiError } from "../utils/api";
import {
  calculateWorkingDays,
  getMinDateString,
  isValidDateRange,
} from "../utils/date";
import toast from "react-hot-toast";

const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [workingDays, setWorkingDays] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<LeaveApplicationForm>();

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  useEffect(() => {
    // Calculate working days when dates change
    if (startDate && endDate && isValidDateRange(startDate, endDate)) {
      const days = calculateWorkingDays(startDate, endDate);
      setWorkingDays(days);
    } else {
      setWorkingDays(0);
    }
  }, [startDate, endDate]);

  const fetchLeaveBalance = async () => {
    try {
      if (user) {
        const response = await api.get(`/employees/me/balance`);
        if (response.data.success) {
          setLeaveBalance(response.data.leaveBalance);
        }
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      toast.error("Failed to fetch leave balance");
    }
  };

  const onSubmit = async (data: LeaveApplicationForm) => {
    try {
      setLoading(true);

      // Validate working days
      if (workingDays <= 0) {
        toast.error("Leave must include at least one working day");
        return;
      }

      if (leaveBalance && workingDays > leaveBalance.available) {
        toast.error(
          `Insufficient leave balance. You have ${leaveBalance.available} days available.`
        );
        return;
      }

      const response = await api.post("/leaves/apply", data);

      if (response.data.success) {
        toast.success("Leave application submitted successfully!");
        reset();
        setWorkingDays(0);
        // Refresh leave balance
        fetchLeaveBalance();
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "vacation", label: "Vacation" },
    { value: "personal", label: "Personal Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "paternity", label: "Paternity Leave" },
  ];

  return (
    <div className="max-w-2xl mx-auto my-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg mr-4">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Apply for Leave
            </h1>
            <p className="text-gray-600">Submit a new leave application</p>
          </div>
        </div>

        {/* Leave Balance Card */}
        {leaveBalance && (
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Leave Balance
                </h3>
                <div className="flex items-center space-x-6 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-success-600">
                      {leaveBalance.available}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Used</p>
                    <p className="text-xl font-semibold text-warning-600">
                      {leaveBalance.used}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-semibold text-gray-700">
                      {leaveBalance.total}
                    </p>
                  </div>
                </div>
              </div>
              <FileText className="h-12 w-12 text-primary-400" />
            </div>
          </div>
        )}
      </div>

      {/* Application Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label htmlFor="leaveType" className="form-label">
              Leave Type *
            </label>
            <select
              id="leaveType"
              className={`form-input ${
                errors.leaveType ? "border-red-300" : ""
              }`}
              {...register("leaveType", {
                required: "Please select a leave type",
              })}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.leaveType.message}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="form-label">
                Start Date *
              </label>
              <input
                id="startDate"
                type="date"
                min={getMinDateString()}
                className={`form-input ${
                  errors.startDate ? "border-red-300" : ""
                }`}
                {...register("startDate", {
                  required: "Start date is required",
                  validate: (value) => {
                    const today = new Date().toISOString().split("T")[0];
                    return value >= today || "Start date cannot be in the past";
                  },
                })}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="form-label">
                End Date *
              </label>
              <input
                id="endDate"
                type="date"
                min={startDate || getMinDateString()}
                className={`form-input ${
                  errors.endDate ? "border-red-300" : ""
                }`}
                {...register("endDate", {
                  required: "End date is required",
                  validate: (value) => {
                    if (!startDate) return true;
                    return (
                      value >= startDate ||
                      "End date must be after or equal to start date"
                    );
                  },
                })}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Working Days Display */}
          {workingDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Total Working Days:{" "}
                    <span className="text-lg">{workingDays}</span>
                  </p>
                  <p className="text-xs text-blue-600">
                    (Weekends are excluded from the calculation)
                  </p>
                </div>
              </div>

              {/* Warning if exceeds balance */}
              {leaveBalance && workingDays > leaveBalance.available && (
                <div className="flex items-center mt-2 p-2 bg-red-50 rounded">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">
                    Warning: You only have {leaveBalance.available} days
                    available.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="form-label">
              Reason for Leave *
            </label>
            <textarea
              id="reason"
              rows={4}
              className={`form-input ${errors.reason ? "border-red-300" : ""}`}
              placeholder="Please provide a detailed reason for your leave request..."
              {...register("reason", {
                required: "Reason is required",
                minLength: {
                  value: 10,
                  message: "Reason must be at least 10 characters long",
                },
                maxLength: {
                  value: 500,
                  message: "Reason cannot exceed 500 characters",
                },
              })}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reason.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Provide a clear and detailed reason for your leave request.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-secondary"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (!!leaveBalance && workingDays > leaveBalance.available)
              }
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
