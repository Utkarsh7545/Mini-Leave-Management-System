import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3,
  PlusCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['employee', 'hr', 'manager']
    },
    {
      name: 'Apply Leave',
      href: '/apply-leave',
      icon: PlusCircle,
      roles: ['employee', 'hr', 'manager']
    },
    {
      name: 'My Leaves',
      href: '/my-leaves',
      icon: Calendar,
      roles: ['employee', 'hr', 'manager']
    },
    {
      name: 'Leave Requests',
      href: '/leave-requests',
      icon: FileText,
      roles: ['hr', 'manager']
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['hr']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['hr', 'manager']
    }
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 pt-16 hidden lg:flex lg:flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="flex-shrink-0 mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p>{user?.department}</p>
            <p className="capitalize">{user?.role}</p>
            <p className="mt-1">
              <span className="font-medium text-primary-600">
                {user?.leaveBalance} days
              </span>{' '}
              available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;