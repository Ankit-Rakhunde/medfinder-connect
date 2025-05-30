
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import ShopDetailsForm from "@/components/shops/ShopDetailsForm";

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

  const {
    userLocation,
    isLoadingLocation,
    getCurrentLocation
  } = useLocationDetection();

  // Update shop coordinates when location is detected
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setShopData(prev => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }));
    }
  }, [userLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShopData(prevData => ({
      ...prevData,
      [name]: name === 'latitude' || name === 'longitude' ? 
        (value === '' ? null : Number(value)) : value,
    }));
  };

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
      
      console.log("Creating shop with user ID:", user.id);
      console.log("Shop data:", shopData);
      
      // Create shop with proper structure including user_id from auth
      const { data, error } = await supabase.from("shops").insert([
        {
          name: shopData.name,
          address: shopData.address,
          phone: shopData.phone,
          maps_link: shopData.maps_link,
          latitude: shopData.latitude,
          longitude: shopData.longitude,
          user_id: user.id, // This should reference auth.users.id
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
        console.log("Shop created successfully:", data[0]);
        toast({
          title: "Shop created",
          description: "Your shop has been created successfully",
        });
        navigate("/stores");
      }
    } catch (error: any) {
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
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <ShopDetailsForm
            shopData={shopData}
            setShopData={setShopData}
            locationDetails={{
              area: userLocation?.area || "",
              pincode: userLocation?.pincode || ""
            }}
            locationLoading={isLoadingLocation}
            getCurrentLocation={getCurrentLocation}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                type="number"
                id="latitude"
                name="latitude"
                value={shopData.latitude || ""}
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="Enter longitude"
                step="any"
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
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
