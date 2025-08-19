import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, Trash2, Eye } from 'lucide-react';
import { LeaveRequest } from '../types';
import api, { handleApiError } from '../utils/api';
import { formatDate, formatDateTime } from '../utils/date';
import toast from 'react-hot-toast';

const MyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/my-requests');
      if (response.data.success) {
        setLeaves(response.data.leaveRequests);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      const response = await api.delete(`/leaves/${leaveId}`);
      if (response.data.success) {
        toast.success('Leave request cancelled successfully');
        fetchMyLeaves();
      }
    } catch (error) {
      toast.error(handleApiError(error));
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

  const filteredLeaves = filter === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in my-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg mr-4">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
            <p className="text-gray-600">View and manage your leave applications</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((leave) => (
            <div key={leave._id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getLeaveTypeLabel(leave.leaveType)}
                    </h3>
                    <span className={`${getStatusBadgeClass(leave.status)} ml-2`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{leave.totalDays} working day{leave.totalDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Applied on {formatDate(leave.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    <strong>Reason:</strong> {leave.reason}
                  </p>

                  {/* Review information */}
                  {leave.status !== 'pending' && leave.reviewedBy && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-600">
                        <strong>{leave.status === 'approved' ? 'Approved' : 'Rejected'} by:</strong>{' '}
                        {leave.reviewedBy.name} on {formatDateTime(leave.reviewedAt!)}
                      </p>
                      {leave.reviewComment && (
                        <p className="text-gray-700 mt-1">
                          <strong>Comment:</strong> {leave.reviewComment}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedLeave(leave)}
                    className="btn-secondary p-2"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {leave.status === 'pending' && (
                    <button
                      onClick={() => handleCancelLeave(leave._id)}
                      className="btn-danger p-2"
                      title="Cancel Request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === 'all' ? 'No leave requests' : `No ${filter} requests`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You haven't applied for any leaves yet." 
                : `You don't have any ${filter} leave requests.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Leave Details Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Leave Request Details</h2>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Leave Type</label>
                    <p className="text-sm text-gray-900">{getLeaveTypeLabel(selectedLeave.leaveType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`${getStatusBadgeClass(selectedLeave.status)} text-sm`}>
                      {selectedLeave.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLeave.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLeave.endDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Total Working Days</label>
                  <p className="text-sm text-gray-900">{selectedLeave.totalDays} day{selectedLeave.totalDays !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLeave.reason}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Applied On</label>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedLeave.createdAt)}</p>
                </div>

                {selectedLeave.status !== 'pending' && selectedLeave.reviewedBy && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reviewed By</label>
                        <p className="text-sm text-gray-900">{selectedLeave.reviewedBy.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reviewed On</label>
                        <p className="text-sm text-gray-900">{formatDateTime(selectedLeave.reviewedAt!)}</p>
                      </div>
                    </div>

                    {selectedLeave.reviewComment && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Review Comment</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {selectedLeave.reviewComment}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {selectedLeave.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleCancelLeave(selectedLeave._id);
                      setSelectedLeave(null);
                    }}
                    className="btn-danger"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
