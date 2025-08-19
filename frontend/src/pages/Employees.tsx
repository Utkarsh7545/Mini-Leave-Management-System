import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Plus, Eye, Calendar } from 'lucide-react';
import { Employee, AddEmployeeForm, LeaveBalance } from '../types';
import api, { handleApiError } from '../utils/api';
import { formatDate } from '../utils/date';
import toast from 'react-hot-toast';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeBalance, setEmployeeBalance] = useState<LeaveBalance | null>(null);
  const [adding, setAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddEmployeeForm>();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeBalance = async (employeeId: string) => {
    try {
      const response = await api.get(`/employees/${employeeId}/balance`);
      if (response.data.success) {
        setEmployeeBalance(response.data.leaveBalance);
      }
    } catch (error) {
      console.error('Error fetching employee balance:', error);
    }
  };

  const onSubmit = async (data: AddEmployeeForm) => {
    try {
      setAdding(true);
      const response = await api.post('/employees', data);
      
      if (response.data.success) {
        toast.success('Employee added successfully!');
        setShowAddModal(false);
        reset();
        fetchEmployees();
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setAdding(false);
    }
  };

  const openEmployeeModal = async (employee: Employee) => {
    setSelectedEmployee(employee);
    await fetchEmployeeBalance(employee.id);
  };

  const closeEmployeeModal = () => {
    setSelectedEmployee(null);
    setEmployeeBalance(null);
  };

  const departments = [
    'HR',
    'Engineering', 
    'Sales',
    'Marketing',
    'Finance',
    'Operations'
  ];

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr', label: 'HR' }
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600">Manage employees and their information</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{employees.length}</p>
          <p className="text-sm text-gray-600">Total Employees</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-success-600">
            {employees.filter(e => e.role === 'employee').length}
          </p>
          <p className="text-sm text-gray-600">Employees</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning-600">
            {employees.filter(e => e.role === 'manager').length}
          </p>
          <p className="text-sm text-gray-600">Managers</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">
            {employees.filter(e => e.role === 'hr').length}
          </p>
          <p className="text-sm text-gray-600">HR</p>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                </div>
              </div>
              <button
                onClick={() => openEmployeeModal(employee)}
                className="btn-secondary p-2"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{employee.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium">{formatDate(employee.joiningDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leave Balance:</span>
                <span className="font-medium text-success-600">{employee.leaveBalance} days</span>
              </div>
            </div>
          </div>
        ))}

        {employees.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first employee.</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    className={`form-input ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="Enter employee's full name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters long'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                    placeholder="Enter employee's email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">Password *</label>
                  <input
                    id="password"
                    type="password"
                    className={`form-input ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="Enter temporary password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Employee can change this password after first login
                  </p>
                </div>

                <div>
                  <label htmlFor="department" className="form-label">Department *</label>
                  <select
                    id="department"
                    className={`form-input ${errors.department ? 'border-red-300' : ''}`}
                    {...register('department', { required: 'Department is required' })}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="form-label">Role *</label>
                  <select
                    id="role"
                    className={`form-input ${errors.role ? 'border-red-300' : ''}`}
                    {...register('role', { required: 'Role is required' })}
                  >
                    <option value="">Select role</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="joiningDate" className="form-label">Joining Date *</label>
                  <input
                    id="joiningDate"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className={`form-input ${errors.joiningDate ? 'border-red-300' : ''}`}
                    {...register('joiningDate', {
                      required: 'Joining date is required',
                      validate: value => {
                        const today = new Date().toISOString().split('T')[0];
                        return value <= today || 'Joining date cannot be in the future';
                      }
                    })}
                  />
                  {errors.joiningDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.joiningDate.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {adding ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Employee'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
                <button
                  onClick={closeEmployeeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedEmployee.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joining Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedEmployee.joiningDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`badge ${selectedEmployee.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leave Balance */}
                {employeeBalance && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Leave Balance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-primary-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Calendar className="h-5 w-5 text-primary-600" />
                        </div>
                        <p className="text-2xl font-bold text-primary-600">{employeeBalance.total}</p>
                        <p className="text-sm text-gray-600">Total Allocated</p>
                      </div>
                      <div className="text-center p-4 bg-warning-50 rounded-lg">
                        <p className="text-2xl font-bold text-warning-600">{employeeBalance.used}</p>
                        <p className="text-sm text-gray-600">Days Used</p>
                      </div>
                      <div className="text-center p-4 bg-success-50 rounded-lg">
                        <p className="text-2xl font-bold text-success-600">{employeeBalance.available}</p>
                        <p className="text-sm text-gray-600">Available</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Leave Utilization</span>
                        <span className="font-medium">
                          {employeeBalance.total > 0 
                            ? Math.round((employeeBalance.used / employeeBalance.total) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: employeeBalance.total > 0 
                              ? `${(employeeBalance.used / employeeBalance.total) * 100}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={closeEmployeeModal}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
