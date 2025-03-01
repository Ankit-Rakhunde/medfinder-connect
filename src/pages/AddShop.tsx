
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Plus, Minus, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Medicine {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

const AddShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    area: "",
    pincode: "",
  });
  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    maps_link: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", description: "", price: "", stock_quantity: "" }
  ]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    toast({
      title: "Getting your location",
      description: "Please wait while we detect your precise location...",
    });
    
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Using combination of OpenStreetMap and Google's Geocoding API for better results
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&lat=${latitude}&lon=${longitude}&` +
              `addressdetails=1&zoom=18&accept-language=en`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch location details');
            }

            const data = await response.json();
            console.log("Location data from API:", data);
            
            // More robust location data extraction with fallbacks
            const area = data.address.suburb || 
                        data.address.neighbourhood || 
                        data.address.residential || 
                        data.address.city_district ||
                        data.address.city ||
                        "Unknown Area";
                        
            const pincode = data.address.postcode || "Unknown Pincode";

            // Construct a detailed address
            const addressParts = [];
            if (data.address.road || data.address.street) addressParts.push(data.address.road || data.address.street);
            if (data.address.house_number) addressParts.push(data.address.house_number);
            if (area) addressParts.push(area);
            if (data.address.city) addressParts.push(data.address.city);
            if (data.address.county || data.address.state_district) addressParts.push(data.address.county || data.address.state_district);
            if (pincode) addressParts.push(pincode);
            if (data.address.state) addressParts.push(data.address.state);
            if (data.address.country) addressParts.push(data.address.country);
            
            const fullAddress = addressParts.join(', ');

            setLocationDetails({
              area: area,
              pincode: pincode,
            });
            
            setShopData(prev => ({
              ...prev,
              latitude,
              longitude,
              maps_link: `https://www.google.com/maps?q=${latitude},${longitude}`,
              address: fullAddress,
            }));

            toast({
              title: "Location detected",
              description: `${area}, ${pincode}`,
            });
          } catch (error) {
            console.error("Error fetching location details:", error);
            
            // Fallback to basic coordinates-based location if API fails
            setShopData(prev => ({
              ...prev,
              latitude,
              longitude,
              maps_link: `https://www.google.com/maps?q=${latitude},${longitude}`,
              address: `Location at coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            }));
            
            toast({
              variant: "destructive",
              title: "Error getting detailed location",
              description: "Using coordinates instead. Please edit the address field manually.",
            });
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          setLocationLoading(false);
          console.error("Geolocation error:", error);
          
          let errorMessage = "Could not get your location";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please enable location services in your browser";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          toast({
            variant: "destructive",
            title: "Error getting location",
            description: errorMessage,
          });
        },
        options
      );
    } else {
      setLocationLoading(false);
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add the user_id to the shop data
      const { data: shopResult, error: shopError } = await supabase
        .from('shops')
        .insert([{
          name: shopData.name,
          address: shopData.address,
          phone: shopData.phone,
          latitude: shopData.latitude,
          longitude: shopData.longitude,
          maps_link: shopData.maps_link,
          user_id: user?.id // Add the user ID from auth context
        }])
        .select()
        .single();

      if (shopError) throw shopError;

      const medicinesWithShopId = medicines
        .filter(medicine => medicine.name.trim() !== '')
        .map(medicine => ({
          shop_id: shopResult.id,
          name: medicine.name,
          description: medicine.description,
          price: parseFloat(medicine.price),
          stock_quantity: parseInt(medicine.stock_quantity),
        }));

      if (medicinesWithShopId.length > 0) {
        const { error: medicinesError } = await supabase
          .from('medicines')
          .insert(medicinesWithShopId);

        if (medicinesError) throw medicinesError;
      }

      toast({
        title: "Success!",
        description: "Shop and medicines have been added successfully."
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

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setMedicines(newMedicines);
  };

  const addMedicineField = () => {
    setMedicines([...medicines, { name: "", description: "", price: "", stock_quantity: "" }]);
  };

  const removeMedicineField = (index: number) => {
    if (medicines.length > 1) {
      const newMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(newMedicines);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Shop</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Shop Details</h2>
              
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full mb-4"
                >
                  {locationLoading ? "Detecting Location..." : "Detect Current Location"}
                </Button>
                
                {(locationDetails.area || locationDetails.pincode || shopData.latitude) && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    {locationDetails.area && (
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-medical-600" />
                        <span className="font-medium">Area:</span> {locationDetails.area}
                      </p>
                    )}
                    {locationDetails.pincode && (
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-medical-600" />
                        <span className="font-medium">Pincode:</span> {locationDetails.pincode}
                      </p>
                    )}
                    {shopData.latitude && shopData.longitude && (
                      <p className="text-xs text-gray-500">
                        Coordinates: {shopData.latitude.toFixed(6)}, {shopData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}
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
                <label htmlFor="maps_link" className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link
                </label>
                <Input
                  id="maps_link"
                  type="url"
                  value={shopData.maps_link}
                  onChange={(e) => setShopData(prev => ({ ...prev, maps_link: e.target.value }))}
                  placeholder="Enter Google Maps link"
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
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Medicines Available</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMedicineField}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Medicine
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Medicine #{index + 1}</h3>
                    {medicines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedicineField(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicine Name
                      </label>
                      <Input
                        required
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                        placeholder="Medicine name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Input
                        value={medicine.description}
                        onChange={(e) => handleMedicineChange(index, "description", e.target.value)}
                        placeholder="Description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={medicine.price}
                        onChange={(e) => handleMedicineChange(index, "price", e.target.value)}
                        placeholder="Price"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                      </label>
                      <Input
                        required
                        type="number"
                        min="0"
                        value={medicine.stock_quantity}
                        onChange={(e) => handleMedicineChange(index, "stock_quantity", e.target.value)}
                        placeholder="Quantity"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding Shop & Medicines..." : "Add Shop & Medicines"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddShop;
