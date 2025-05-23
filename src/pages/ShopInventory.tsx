
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ShopDetailsDisplay from "@/components/shops/ShopDetailsDisplay";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import { 
  InventoryLoading, 
  InventoryError, 
  ShopNotFound, 
  AccessDenied 
} from "@/components/inventory/InventoryStatus";

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
    return <InventoryLoading />;
  }

  if (shopError || medicinesError) {
    return <InventoryError message={shopError?.message || medicinesError?.message || ""} />;
  }

  if (!shop) {
    return <ShopNotFound />;
  }

  // Don't show the inventory if user is not the shop owner
  if (!isShopOwner) {
    return <AccessDenied />;
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
          <InventoryHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <InventoryTable medicines={medicines || []} searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
};

export default ShopInventory;
