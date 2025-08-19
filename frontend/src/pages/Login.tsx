import React, { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../types";

const Login: React.FC = () => {
  const { user, login, loading } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // Redirect if already logged in
  if (user && !loading) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLogging(true);
    await login(data.email, data.password);
    setIsLogging(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-500 text-white p-3 rounded-xl">
            <User className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Leave Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`form-input pr-10 ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLogging}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLogging ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
