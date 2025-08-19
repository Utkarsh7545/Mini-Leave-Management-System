export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'employee' | 'hr' | 'manager';
  leaveBalance: number;
  joiningDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  _id: string;
  employee: Employee;
  startDate: string;
  endDate: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  totalDays: number;
  reviewedBy?: Employee;
  reviewedAt?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  total: number;
  used: number;
  available: number;
  employee: {
    id: string;
    name: string;
    department: string;
    joiningDate: string;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'employee' | 'hr' | 'manager';
  leaveBalance: number;
  joiningDate?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface AddEmployeeForm {
  name: string;
  email: string;
  password: string;
  department: string;
  joiningDate: string;
  role: 'employee' | 'hr' | 'manager';
}

export interface LeaveApplicationForm {
  startDate: string;
  endDate: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'emergency' | 'maternity' | 'paternity';
  reason: string;
}

export interface ReviewLeaveForm {
  comment?: string;
}