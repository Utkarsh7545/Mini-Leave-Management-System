import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Eye, EyeOff } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api, { handleApiError } from "../utils/api";
import toast from "react-hot-toast";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  department:
    | "HR"
    | "Engineering"
    | "Sales"
    | "Marketing"
    | "Finance"
    | "Operations";
  joiningDate: string;
};

const Signup: React.FC = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupForm>();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: SignupForm) => {
    try {
      setSubmitting(true);
      const response = await api.post("/auth/register", data);
      if (response.data.success) {
        toast.success("Signup successful! Please login.");
        reset();
        window.location.href = "/login";
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const departments = [
    "HR",
    "Engineering",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-500 text-white p-3 rounded-xl">
            <User className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Leave Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? "border-red-300" : ""}`}
                placeholder="Enter your full name"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "border-red-300" : ""}`}
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value:
                      /^(?:[a-zA-Z0-9_]+(?:[.-]?[a-zA-Z0-9_]+)*)@(?:[a-zA-Z0-9]+(?:[.-]?[a-zA-Z0-9]+)*)\.[a-zA-Z]{2,3}$/,
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

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input pr-10 ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  placeholder="Create a password"
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
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <select
                id="department"
                className={`form-input ${
                  errors.department ? "border-red-300" : ""
                }`}
                {...register("department", {
                  required: "Department is required",
                })}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="joiningDate" className="form-label">
                Joining Date
              </label>
              <input
                id="joiningDate"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className={`form-input ${
                  errors.joiningDate ? "border-red-300" : ""
                }`}
                {...register("joiningDate", {
                  required: "Joining date is required",
                })}
              />
              {errors.joiningDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.joiningDate.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="spinner mr-2"></div>Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
