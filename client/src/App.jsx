import "./App.css";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import RoleBasedRoute from "./components/RoleBasedRoute.jsx";
import Admin from "./pages/Admin";
import Partner from "./pages/Partner";
import SingleMovie from "./pages/SingleMovie";
import BookShow from "./pages/Bookshow";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import MyBookings from "./pages/User/MyBooking.jsx";
import AiChatbot from "./components/AiChatbot";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes - User Only */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["user"]}>
                  <Home />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/singleMovie/:id/"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["user"]}>
                  <SingleMovie />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookshow/:id"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["user"]}>
                  <BookShow />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["user"]}>
                  <PaymentSuccess />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["user"]}>
                  <MyBookings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin Only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <Admin />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Partner Only */}
          <Route
            path="/partner"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["partner"]}>
                  <Partner />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
        <AiChatbot />
      </BrowserRouter>
    </>
  );
}

export default App;
