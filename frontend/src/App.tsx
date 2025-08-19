import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import LeaveRequests from "./pages/LeaveRequests";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";

function App() {
  const { loading } = useAuth();

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
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/apply-leave"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplyLeave />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-leaves"
        element={
          <ProtectedRoute>
            <Layout>
              <MyLeaves />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave-requests"
        element={
          <ProtectedRoute roles={["hr", "manager"]}>
            <Layout>
              <LeaveRequests />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute roles={["hr"]}>
            <Layout>
              <Employees />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["hr", "manager"]}>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
