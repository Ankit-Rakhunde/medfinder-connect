
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all shops
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ["allShops"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shops").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all medicines
  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ["allMedicines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select(`
          *,
          shops:shop_id (
            name,
            address
          )
        `);
      if (error) throw error;
      return data || [];
    },
  });

  // Delete shop mutation
  const deleteShopMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const { error } = await supabase.from("shops").delete().eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allShops"] });
      queryClient.invalidateQueries({ queryKey: ["allMedicines"] });
      toast({
        title: "Shop deleted",
        description: "Shop has been removed from the system",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting shop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: async (medicineId: string) => {
      const { error } = await supabase.from("medicines").delete().eq("id", medicineId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMedicines"] });
      toast({
        title: "Medicine deleted",
        description: "Medicine has been removed from the system",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting medicine",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteShop = (shopId: string) => {
    if (confirm("Are you sure you want to delete this shop? This will also delete all associated medicines.")) {
      deleteShopMutation.mutate(shopId);
    }
  };

  const handleDeleteMedicine = (medicineId: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      deleteMedicineMutation.mutate(medicineId);
    }
  };

  const filteredShops = shops?.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredMedicines = medicines?.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.shops && medicine.shops.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage all shops and medicines in the system</p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search shops or medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="shops" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shops">All Shops ({shops?.length || 0})</TabsTrigger>
          <TabsTrigger value="medicines">All Medicines ({medicines?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="shops" className="space-y-4">
          {shopsLoading ? (
            <div>Loading shops...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShops.map((shop) => (
                <Card key={shop.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{shop.name}</CardTitle>
                    <CardDescription>{shop.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {shop.phone && <p className="text-sm text-gray-600">Phone: {shop.phone}</p>}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteShop(shop.id)}
                          disabled={deleteShopMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medicines" className="space-y-4">
          {medicinesLoading ? (
            <div>Loading medicines...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.map((medicine) => (
                <Card key={medicine.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{medicine.name}</CardTitle>
                    <CardDescription>
                      {medicine.shops ? `Available at ${medicine.shops.name}` : 'No shop assigned'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">Price: ₹{medicine.price}</p>
                      <p className="text-sm">Stock: {medicine.stock_quantity}</p>
                      {medicine.description && (
                        <p className="text-sm text-gray-600">{medicine.description}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          disabled={deleteMedicineMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
