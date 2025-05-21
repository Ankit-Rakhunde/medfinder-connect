import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

interface Shop {
  name: string;
  address: string;
  phone: string;
  maps_link: string;
  latitude: number | null;
  longitude: number | null;
}

const AddShop = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState<Shop>({
    name: "",
    address: "",
    phone: "",
    maps_link: "",
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShopData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fix the shop type to include all required properties
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to add a shop",
          variant: "destructive",
        });
        return;
      }
      
      // Create shop with proper structure including user_id
      const { data, error } = await supabase.from("shops").insert([
        {
          name: shopData.name,
          address: shopData.address,
          phone: shopData.phone,
          maps_link: shopData.maps_link,
          latitude: shopData.latitude,
          longitude: shopData.longitude,
          user_id: user.id, // Add the user_id field
        },
      ]).select();
      
      if (error) {
        console.error("Error creating shop:", error);
        toast({
          title: "Error creating shop",
          description: error.message,
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        toast({
          title: "Shop created",
          description: "Your shop has been created successfully",
        });
        navigate("/stores");
      }
    } catch (error : any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected error",
        description: error.message || "Failed to create shop",
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Your Shop</h1>
          <p className="text-gray-600">List your medical store to reach more customers</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Shop Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={shopData.name}
              onChange={handleChange}
              placeholder="Enter shop name"
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={shopData.address}
              onChange={handleChange}
              placeholder="Enter shop address"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={shopData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="maps_link">Google Maps Link</Label>
            <Input
              type="url"
              id="maps_link"
              name="maps_link"
              value={shopData.maps_link}
              onChange={handleChange}
              placeholder="Enter Google Maps link"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                type="number"
                id="latitude"
                name="latitude"
                value={shopData.latitude || ""}
                onChange={handleChange as any}
                placeholder="Enter latitude"
                step="any"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                type="number"
                id="longitude"
                name="longitude"
                value={shopData.longitude || ""}
                onChange={handleChange as any}
                placeholder="Enter longitude"
                step="any"
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Adding Shop...
                <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              "Add Shop"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddShop;
