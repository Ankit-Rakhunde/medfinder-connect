import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Pill, ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ShopDetailsDisplay from "@/components/shops/ShopDetailsDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Medicine {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  maps_link: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: string | null;
}

const ShopInventory = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch shop details
  const {
    data: shop,
    isLoading: shopLoading,
    error: shopError,
  } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId)
        .single();

      if (error) throw error;
      return data as Shop;
    },
    enabled: !!shopId,
  });

  // Fetch medicines for the shop
  const {
    data: medicines,
    isLoading: medicinesLoading,
    error: medicinesError,
  } = useQuery({
    queryKey: ["medicines", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .eq("shop_id", shopId);

      if (error) throw error;
      return (data || []) as Medicine[];
    },
    enabled: !!shopId,
  });

  // Filter medicines based on search term
  const filteredMedicines = medicines?.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.description && 
        medicine.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if user is the shop owner
  const isShopOwner = shop && user && shop.user_id === user.id;

  useEffect(() => {
    if (shop && user && shop.user_id !== user.id) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this shop's inventory",
        variant: "destructive",
      });
    }
  }, [shop, user, toast]);

  if (shopLoading || medicinesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto py-16 px-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (shopError || medicinesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto py-16 px-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h2 className="font-medium">Error</h2>
            <p>{shopError?.message || medicinesError?.message || "Failed to load data"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
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
  }

  // Don't show the inventory if user is not the shop owner
  if (!isShopOwner) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-8 px-6 mt-16">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link to="/stores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Inventory</h1>
            <p className="text-gray-600">Manage medicines and stock for your shop</p>
          </div>
        </div>

        {/* Shop details section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Shop Information</h2>
          <ShopDetailsDisplay shopData={shop} />
        </div>

        <Separator className="my-6" />

        {/* Inventory section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="h-5 w-5" /> 
              Medicine Inventory
            </h2>

            <div className="flex gap-2 w-full md:w-auto">
              <Input 
                type="search" 
                placeholder="Search medicines..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Button asChild>
                <Link to="/add-shop">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Link>
              </Button>
            </div>
          </div>

          {filteredMedicines && filteredMedicines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.description || "—"}</TableCell>
                    <TableCell>₹{medicine.price}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          medicine.stock_quantity > 10
                            ? "bg-green-100 text-green-800"
                            : medicine.stock_quantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {medicine.stock_quantity}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <Pill className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No medicines found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm 
                  ? "No medicines match your search criteria" 
                  : "Start adding medicines to your inventory"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/add-shop">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopInventory;
