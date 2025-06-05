
import Navigation from "@/components/Navigation";
import CreateAdminUser from "@/components/admin/CreateAdminUser";

const AdminSetup = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
            <p className="text-gray-600">Create your admin account to manage the system</p>
          </div>
          <CreateAdminUser />
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
