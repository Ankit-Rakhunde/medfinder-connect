
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const QuickAddMedicine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [medicineData, setMedicineData] = useState({
    name: "",
    price: 0,
    stock_quantity: 0,
    shop_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's shops
  const { data: userShops } = useQuery({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineData.shop_id) {
      toast({
        title: "Please select a shop",
        description: "You must select which shop to add the medicine to",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("medicines").insert([
        {
          name: medicineData.name,
          price: medicineData.price,
          stock_quantity: medicineData.stock_quantity,
          shop_id: medicineData.shop_id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Medicine added successfully",
        description: `${medicineData.name} has been added to your inventory`,
      });

      // Reset form
      setMedicineData({ name: "", price: 0, stock_quantity: 0, shop_id: "" });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error adding medicine",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userShops || userShops.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Quick Add Medicine
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Medicine</CardTitle>
            <CardDescription>Quickly add a new medicine to your shop</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="shop_select">Select Shop</Label>
                <select
                  id="shop_select"
                  value={medicineData.shop_id}
                  onChange={(e) => setMedicineData(prev => ({ ...prev, shop_id: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a shop</option>
                  {userShops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="medicine_name">Medicine Name</Label>
                <Input
                  id="medicine_name"
                  placeholder="e.g., Paracetamol"
                  value={medicineData.name}
                  onChange={(e) => setMedicineData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={medicineData.price}
                    onChange={(e) => setMedicineData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={medicineData.stock_quantity}
                    onChange={(e) => setMedicineData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Medicine"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickAddMedicine;
