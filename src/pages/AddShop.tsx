
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";

const AddShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setShopData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast({
            title: "Location detected",
            description: "Current location has been captured successfully."
          });
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error getting location",
            description: error.message
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('shops')
        .insert([shopData]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Shop has been added successfully."
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Shop</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>
              <Input
                id="name"
                required
                value={shopData.name}
                onChange={(e) => setShopData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter shop name"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                id="address"
                required
                value={shopData.address}
                onChange={(e) => setShopData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter shop address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={shopData.phone}
                onChange={(e) => setShopData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full mb-4"
              >
                Detect Current Location
              </Button>
              
              {(shopData.latitude && shopData.longitude) && (
                <p className="text-sm text-green-600">
                  Location detected: {shopData.latitude.toFixed(6)}, {shopData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding Shop..." : "Add Shop"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddShop;
