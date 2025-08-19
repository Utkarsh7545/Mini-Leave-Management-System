import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-primary-500 text-white p-2 rounded-lg mr-3">
                <User className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                Leave Management System
              </h1>
              <h1 className="text-lg font-semibold text-gray-900 sm:hidden">
                LMS
              </h1>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 p-2 hover:bg-gray-50 transition-colors"
              >
                <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-2">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 sm:hidden">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>

                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-gray-500">{user?.department}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
