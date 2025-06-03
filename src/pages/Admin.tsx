
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;
