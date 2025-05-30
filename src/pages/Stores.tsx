
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Store, MapPin, Phone, ExternalLink, Filter, 
  Layers, GripVertical, Plus
} from "lucide-react";
import Navigation from "../components/Navigation";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import ShopDetailsDisplay from "@/components/shops/ShopDetailsDisplay";
import { Link } from "react-router-dom";

const Stores = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<string>("grid");

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shops").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Get user's own shops
  const { data: userShops, isLoading: userShopsLoading } = useQuery({
    queryKey: ["userShops", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (stores) {
      let filtered = [...stores];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (store) =>
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredStores(filtered);
    }
  }, [stores, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto py-8 px-6 mt-16">
        {/* User's Shops Section - Only show if user is logged in and has shops */}
        {user && userShops && userShops.length > 0 && (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">My Shops</h2>
                <Button asChild>
                  <Link to="/add-shop">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Shop
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userShops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden hover:shadow-md transition-shadow border-blue-200">
                    <CardHeader className="pb-3 bg-blue-50">
                      <CardTitle className="text-xl flex justify-between items-start">
                        <span>{shop.name}</span>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">My Shop</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ShopDetailsDisplay shopData={shop} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Separator className="my-8" />
          </>
        )}

        {/* Add Shop Button for logged in users without shops */}
        {user && (!userShops || userShops.length === 0) && !userShopsLoading && (
          <>
            <div className="text-center py-8 mb-8">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No shops found</h3>
              <p className="mt-1 text-gray-500">Start by adding your first medical shop</p>
              <Button asChild className="mt-4">
                <Link to="/add-shop">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your Shop
                </Link>
              </Button>
            </div>
            <Separator className="my-8" />
          </>
        )}

        {/* All Stores Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Medical Stores</h1>
            <p className="text-gray-600 mt-1">
              Find pharmacies and medical stores near you
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by name or location"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-700">
            {isLoading ? "Loading stores..." : 
             filteredStores.length === 0 ? "No stores found" : 
             `${filteredStores.length} stores found`}
          </h2>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-primary/10" : ""}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Grid</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary/10" : ""}
            >
              <GripVertical className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">List</span>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="animate-pulse">
                <CardHeader className="bg-gray-100 h-32"></CardHeader>
                <CardContent className="pt-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-16">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search parameters</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card key={store.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex justify-between items-start">
                    <span>{store.name}</span>
                  </CardTitle>
                  {store.description && (
                    <CardDescription>{store.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <ShopDetailsDisplay shopData={store} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <div key={store.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <ShopDetailsDisplay shopData={store} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;
