
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Medicine {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
}

const AddMedicine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state?.shopId;
  
  const [medicineData, setMedicineData] = useState<Medicine>({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicineData(prevData => ({
      ...prevData,
      [name]: name === 'price' || name === 'stock_quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to add a medicine",
          variant: "destructive",
        });
        return;
      }

      if (!shopId) {
        toast({
          title: "Shop not specified",
          description: "Please access this page from your shop inventory",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Adding medicine to shop:", shopId);
      console.log("Medicine data:", medicineData);
      
      const { data, error } = await supabase.from("medicines").insert([
        {
          name: medicineData.name,
          description: medicineData.description,
          price: medicineData.price,
          stock_quantity: medicineData.stock_quantity,
          shop_id: shopId,
        },
      ]).select();
      
      if (error) {
        console.error("Error adding medicine:", error);
        toast({
          title: "Error adding medicine",
          description: error.message,
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        console.log("Medicine added successfully:", data[0]);
        toast({
          title: "Medicine added",
          description: "Medicine has been added to your inventory",
        });
        navigate(`/shop-inventory/${shopId}`);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected error",
        description: error.message || "Failed to add medicine",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-8 px-6 mt-16">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link to={shopId ? `/shop-inventory/${shopId}` : "/stores"}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Medicine</h1>
            <p className="text-gray-600">Add a new medicine to your shop inventory</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div>
            <Label htmlFor="name">Medicine Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={medicineData.name}
              onChange={handleChange}
              placeholder="Enter medicine name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={medicineData.description}
              onChange={handleChange}
              placeholder="Enter medicine description (optional)"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={medicineData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                value={medicineData.stock_quantity}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                min="0"
                required
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                Adding Medicine...
                <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              "Add Medicine"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddMedicine;
