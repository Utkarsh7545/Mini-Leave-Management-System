import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import { Employee, LeaveRequest } from '../types';
import api, { handleApiError } from '../utils/api';
import { formatDate } from '../utils/date';
import toast from 'react-hot-toast';

interface ReportData {
  totalEmployees: number;
  totalLeaveRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  departmentStats: { [key: string]: number };
  monthlyStats: { [key: string]: number };
  leaveTypeStats: { [key: string]: number };
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalEmployees: 0,
    totalLeaveRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    departmentStats: {},
    monthlyStats: {},
    leaveTypeStats: {}
  });
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees and leave requests
      const [employeesRes, leavesRes] = await Promise.all([
        api.get('/employees'),
        api.get('/leaves/requests?limit=100')
      ]);

      if (employeesRes.data.success && leavesRes.data.success) {
        const employees: Employee[] = employeesRes.data.employees;
        const leaves: LeaveRequest[] = leavesRes.data.leaveRequests;

        // Calculate statistics
        const departmentStats: { [key: string]: number } = {};
        const monthlyStats: { [key: string]: number } = {};
        const leaveTypeStats: { [key: string]: number } = {};

        // Department statistics
        employees.forEach(emp => {
          departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
        });

        // Monthly and leave type statistics
        const currentYear = new Date().getFullYear();
        leaves.forEach(leave => {
          const leaveDate = new Date(leave.createdAt);
          if (leaveDate.getFullYear() === currentYear) {
            const month = leaveDate.toLocaleString('default', { month: 'short' });
            monthlyStats[month] = (monthlyStats[month] || 0) + 1;
          }

          leaveTypeStats[leave.leaveType] = (leaveTypeStats[leave.leaveType] || 0) + 1;
        });

        setReportData({
          totalEmployees: employees.length,
          totalLeaveRequests: leaves.length,
          pendingRequests: leaves.filter(l => l.status === 'pending').length,
          approvedRequests: leaves.filter(l => l.status === 'approved').length,
          rejectedRequests: leaves.filter(l => l.status === 'rejected').length,
          departmentStats,
          monthlyStats,
          leaveTypeStats
        });

        setRecentLeaves(leaves.slice(0, 10));
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      default:
        return 'badge';
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sick: 'Sick Leave',
      vacation: 'Vacation',
      personal: 'Personal Leave',
      emergency: 'Emergency Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
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
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="bg-primary-100 text-primary-600 p-3 rounded-lg mr-4">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Overview of leave management statistics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.totalLeaveRequests}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-warning-100 text-warning-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-success-100 text-success-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approval Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reportData.totalLeaveRequests > 0 
                  ? Math.round((reportData.approvedRequests / reportData.totalLeaveRequests) * 100)
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Department Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees by Department</h3>
          <div className="space-y-3">
            {Object.entries(reportData.departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{dept}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ 
                        width: `${(count / reportData.totalEmployees) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Type Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Requests by Type</h3>
          <div className="space-y-3">
            {Object.entries(reportData.leaveTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{getLeaveTypeLabel(type)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-success-500 h-2 rounded-full"
                      style={{ 
                        width: `${(count / reportData.totalLeaveRequests) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Request Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">{reportData.approvedRequests}</div>
            <div className="text-sm text-gray-600">Approved Requests</div>
            <div className="text-xs text-gray-500 mt-1">
              {reportData.totalLeaveRequests > 0 
                ? Math.round((reportData.approvedRequests / reportData.totalLeaveRequests) * 100)
                : 0
              }% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">{reportData.pendingRequests}</div>
            <div className="text-sm text-gray-600">Pending Reviews</div>
            <div className="text-xs text-gray-500 mt-1">
              {reportData.totalLeaveRequests > 0 
                ? Math.round((reportData.pendingRequests / reportData.totalLeaveRequests) * 100)
                : 0
              }% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-danger-600 mb-2">{reportData.rejectedRequests}</div>
            <div className="text-sm text-gray-600">Rejected Requests</div>
            <div className="text-xs text-gray-500 mt-1">
              {reportData.totalLeaveRequests > 0 
                ? Math.round((reportData.rejectedRequests / reportData.totalLeaveRequests) * 100)
                : 0
              }% of total
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{leave.employee.name}</div>
                      <div className="text-sm text-gray-500">{leave.employee.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLeaveTypeLabel(leave.leaveType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</div>
                      <div className="text-xs text-gray-500">{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${getStatusBadgeClass(leave.status)} text-xs`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(leave.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentLeaves.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
              <p className="mt-1 text-sm text-gray-500">No leave requests have been submitted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
