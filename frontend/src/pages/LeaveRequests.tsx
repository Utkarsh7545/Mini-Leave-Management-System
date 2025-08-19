import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Check, X, Eye, Filter } from 'lucide-react';
import { LeaveRequest, ReviewLeaveForm } from '../types';
import api, { handleApiError } from '../utils/api';
import { formatDate, formatDateTime } from '../utils/date';
import toast from 'react-hot-toast';

const LeaveRequests: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewLeaveForm>();

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leaves/requests?status=${filter === 'all' ? '' : filter}&limit=50`);
      if (response.data.success) {
        setLeaves(response.data.leaveRequests);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLeave = async (data: ReviewLeaveForm) => {
    if (!selectedLeave || !reviewAction) return;

    try {
      setReviewing(true);
      const endpoint = `/leaves/${selectedLeave._id}/${reviewAction}`;
      const response = await api.put(endpoint, { comment: data.comment });
      
      if (response.data.success) {
        toast.success(`Leave request ${reviewAction}d successfully`);
        setSelectedLeave(null);
        setReviewAction(null);
        reset();
        fetchLeaveRequests();
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setReviewing(false);
    }
  };

  const openReviewModal = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    reset();
  };

  const closeReviewModal = () => {
    setSelectedLeave(null);
    setReviewAction(null);
    reset();
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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600">Review and manage employee leave applications</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'pending', label: 'Pending Review', count: leaves.filter(l => l.status === 'pending').length },
              { key: 'all', label: 'All Requests' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  filter === filterOption.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
                {'count' in filterOption && filterOption.count > 0 && (
                  <span className="ml-2 bg-white text-primary-500 px-2 py-0.5 rounded-full text-xs">
                    {filterOption.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaves.length > 0 ? (
          leaves.map((leave) => (
            <div key={leave._id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {leave.employee.name} - {getLeaveTypeLabel(leave.leaveType)}
                      </h3>
                      <p className="text-sm text-gray-600">{leave.employee.department}</p>
                    </div>
                    <span className={`${getStatusBadgeClass(leave.status)} ml-2`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                      <p className="text-gray-600">{leave.totalDays} working day{leave.totalDays !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Applied:</span>
                      <p className="font-medium">{formatDate(leave.createdAt)}</p>
                    </div>
                    {leave.status !== 'pending' && leave.reviewedBy && (
                      <div className="text-sm">
                        <span className="text-gray-500">Reviewed by:</span>
                        <p className="font-medium">{leave.reviewedBy.name}</p>
                        <p className="text-gray-600">{formatDateTime(leave.reviewedAt!)}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
                    <span className="text-gray-500">Reason:</span>
                    <p className="text-gray-900 mt-1">{leave.reason}</p>
                  </div>

                  {leave.reviewComment && (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <span className="text-gray-500">Review Comment:</span>
                      <p className="text-gray-900 mt-1">{leave.reviewComment}</p>
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
                    <>
                      <button
                        onClick={() => openReviewModal(leave, 'approve')}
                        className="btn-success p-2"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openReviewModal(leave, 'reject')}
                        className="btn-danger p-2"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === 'all' ? 'No leave requests' : `No ${filter} requests`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'pending' 
                ? 'All caught up! No pending leave requests to review.'
                : `There are no ${filter === 'all' ? '' : filter} leave requests at the moment.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Leave Details Modal */}
      {selectedLeave && !reviewAction && (
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
                    <label className="text-sm font-medium text-gray-500">Employee</label>
                    <p className="text-sm text-gray-900">{selectedLeave.employee.name}</p>
                    <p className="text-xs text-gray-600">{selectedLeave.employee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-sm text-gray-900">{selectedLeave.employee.department}</p>
                  </div>
                </div>

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
                  <>
                    <button
                      onClick={() => openReviewModal(selectedLeave, 'reject')}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openReviewModal(selectedLeave, 'approve')}
                      className="btn-success"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedLeave && reviewAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
                </h2>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Employee:</strong> {selectedLeave.employee.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Leave:</strong> {getLeaveTypeLabel(selectedLeave.leaveType)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Duration:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)} ({selectedLeave.totalDays} day{selectedLeave.totalDays !== 1 ? 's' : ''})
                </p>
              </div>

              <form onSubmit={handleSubmit(handleReviewLeave)} className="space-y-4">
                <div>
                  <label htmlFor="comment" className="form-label">
                    {reviewAction === 'reject' ? 'Reason for rejection *' : 'Comment (optional)'}
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    className={`form-input ${errors.comment ? 'border-red-300' : ''}`}
                    placeholder={
                      reviewAction === 'reject'
                        ? 'Please provide a reason for rejecting this leave request...'
                        : 'Add any comments about this approval...'
                    }
                    {...register('comment', 
                      reviewAction === 'reject' 
                        ? { 
                            required: 'Reason for rejection is required',
                            minLength: {
                              value: 10,
                              message: 'Reason must be at least 10 characters long'
                            }
                          }
                        : {}
                    )}
                  />
                  {errors.comment && (
                    <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewing}
                    className={`${
                      reviewAction === 'approve' ? 'btn-success' : 'btn-danger'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                  >
                    {reviewing ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
