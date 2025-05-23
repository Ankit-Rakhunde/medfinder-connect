
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface InventoryErrorProps {
  message: string;
}

export const InventoryLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-16 px-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    </div>
  );
};

export const InventoryError = ({ message }: InventoryErrorProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-16 px-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="font-medium">Error</h2>
          <p>{message || "Failed to load data"}</p>
        </div>
      </div>
    </div>
  );
};

export const ShopNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-16 px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Shop Not Found</h2>
          <p className="mt-2 text-gray-600">The shop you're looking for doesn't exist</p>
          <Button asChild className="mt-4">
            <Link to="/stores">Back to Stores</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-16 px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to view this shop's inventory</p>
          <Button asChild className="mt-4">
            <Link to="/stores">Back to Stores</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
