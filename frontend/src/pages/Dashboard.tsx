import React, { useEffect, useState } from "react";
import { Calendar, Users, FileText, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { LeaveRequest, LeaveBalance } from "../types";
import api, { handleApiError } from "../utils/api";
import { formatDate } from "../utils/date";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch leave balance
      if (user) {
        const balanceResponse = await api.get(`/employees/me/balance`);
        if (balanceResponse.data.success) {
          setLeaveBalance(balanceResponse.data.leaveBalance);
        }

        // Fetch recent leaves
        const leavesResponse = await api.get("/leaves/my-requests");
        if (leavesResponse.data.success) {
          setRecentLeaves(leavesResponse.data.leaveRequests.slice(0, 5));
        }

        // Fetch stats for HR
        if (user.role === "hr" || user.role === "manager") {
          const [employeesRes, requestsRes] = await Promise.all([
            api.get("/employees"),
            api.get("/leaves/requests?limit=100"),
          ]);

          if (employeesRes.data.success) {
            setStats((prev) => ({
              ...prev,
              totalEmployees: employeesRes.data.employees.length,
            }));
          }

          if (requestsRes.data.success) {
            const requests = requestsRes.data.leaveRequests;
            const pending = requests.filter(
              (r: LeaveRequest) => r.status === "pending"
            ).length;
            const thisMonth = new Date().getMonth();
            const approvedThisMonth = requests.filter(
              (r: LeaveRequest) =>
                r.status === "approved" &&
                new Date(r.reviewedAt || "").getMonth() === thisMonth
            ).length;

            setStats((prev) => ({
              ...prev,
              pendingRequests: pending,
              approvedThisMonth,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-pending";
      case "approved":
        return "badge-approved";
      case "rejected":
        return "badge-rejected";
      default:
        return "badge";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in my-10">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your leave management dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Leave Balance */}
        <div className="card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Available Leaves
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {leaveBalance?.available || 0}
              </p>
              <p className="text-xs text-gray-500">
                {leaveBalance?.used || 0} used of {leaveBalance?.total || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Employees (HR only) */}
        {(user?.role === "hr" || user?.role === "manager") && (
          <div className="card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-success-100 text-success-600 p-3 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Employees
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests (HR only) */}
        {(user?.role === "hr" || user?.role === "manager") && (
          <div className="card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-warning-100 text-warning-600 p-3 rounded-lg">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Requests
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pendingRequests}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approved This Month (HR only) */}
        {(user?.role === "hr" || user?.role === "manager") && (
          <div className="card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Approved This Month
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.approvedThisMonth}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Recent Leaves */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Leave Requests
            </h2>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>

          {recentLeaves.length > 0 ? (
            <div className="space-y-4">
              {recentLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {leave.leaveType} Leave
                      </p>
                      <span
                        className={`${getStatusBadgeClass(
                          leave.status
                        )} text-xs`}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(leave.startDate)} -{" "}
                      {formatDate(leave.endDate)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No leave requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't applied for any leaves yet.
              </p>
            </div>
          )}
        </div>

        {/* Leave Balance Details */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Leave Balance Breakdown
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          {leaveBalance && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Used Leave Days</span>
                  <span className="font-medium">
                    {leaveBalance.used}/{leaveBalance.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (leaveBalance.used / leaveBalance.total) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Balance details */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {leaveBalance.total}
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="text-center p-3 bg-warning-50 rounded-lg">
                  <p className="text-2xl font-bold text-warning-600">
                    {leaveBalance.used}
                  </p>
                  <p className="text-xs text-gray-600">Used</p>
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <p className="text-2xl font-bold text-success-600">
                    {leaveBalance.available}
                  </p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
