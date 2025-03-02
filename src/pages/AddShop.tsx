
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Plus, Minus, MapPin, Save, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Medicine {
  id?: string;
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  maps_link: string | null;
  latitude: number | null;
  longitude: number | null;
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

  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isNewShop, setIsNewShop] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [shopMedicines, setShopMedicines] = useState<Medicine[]>([]);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Fetch user's shops on component mount
  useEffect(() => {
    if (user) {
      fetchUserShops();
    }
  }, [user]);

  // Fetch shop medicines when a shop is selected
  useEffect(() => {
    if (selectedShopId) {
      fetchShopMedicines(selectedShopId);
      fetchShopDetails(selectedShopId);
      setIsNewShop(false);
    } else {
      setIsNewShop(true);
      resetForm();
    }
  }, [selectedShopId]);

  const fetchUserShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserShops(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching shops",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchShopDetails = async (shopId: string) => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error) throw error;

      if (data) {
        setShopData({
          name: data.name,
          address: data.address,
          phone: data.phone || "",
          maps_link: data.maps_link || "",
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching shop details",
        description: error.message
      });
    }
  };

  const fetchShopMedicines = async (shopId: string) => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('shop_id', shopId);

      if (error) throw error;

      if (data && data.length > 0) {
        setShopMedicines(data.map(med => ({
          id: med.id,
          name: med.name,
          description: med.description || "",
          price: med.price.toString(),
          stock_quantity: med.stock_quantity.toString()
        })));
      } else {
        setShopMedicines([]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching medicines",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setShopData({
      name: "",
      address: "",
      phone: "",
      maps_link: "",
      latitude: null,
      longitude: null,
    });
    setMedicines([{ name: "", description: "", price: "", stock_quantity: "" }]);
    setLocationDetails({ area: "", pincode: "" });
  };

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
      if (isNewShop) {
        // Adding a new shop
        const { data: shopResult, error: shopError } = await supabase
          .from('shops')
          .insert([{
            name: shopData.name,
            address: shopData.address,
            phone: shopData.phone,
            latitude: shopData.latitude,
            longitude: shopData.longitude,
            maps_link: shopData.maps_link,
            user_id: user?.id
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
        
        // Update the local shops list
        await fetchUserShops();
        setSelectedShopId(shopResult.id);
      } else if (editMode) {
        // Updating existing shop
        const { error: shopError } = await supabase
          .from('shops')
          .update({
            name: shopData.name,
            address: shopData.address,
            phone: shopData.phone,
            latitude: shopData.latitude,
            longitude: shopData.longitude,
            maps_link: shopData.maps_link,
          })
          .eq('id', selectedShopId);

        if (shopError) throw shopError;

        toast({
          title: "Success!",
          description: "Shop details updated successfully."
        });
        
        // Update the local shops list
        await fetchUserShops();
        setEditMode(false);
      }
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

  const updateMedicineStock = async (medicineId: string, newStock: string) => {
    setUpdatingStock(true);
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ stock_quantity: parseInt(newStock) })
        .eq('id', medicineId);

      if (error) throw error;

      toast({
        title: "Stock updated",
        description: "Medicine stock has been updated successfully."
      });

      // Update local state
      if (selectedShopId) {
        await fetchShopMedicines(selectedShopId);
      }
      setEditingMedicine(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating stock",
        description: error.message
      });
    } finally {
      setUpdatingStock(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isNewShop ? "Add New Shop" : "Manage Shop"}
          </h1>

          {userShops.length > 0 && (
            <div className="mb-8">
              <label htmlFor="shop-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select a shop to manage
              </label>
              <div className="flex gap-2">
                <select
                  id="shop-select"
                  value={selectedShopId || ""}
                  onChange={(e) => setSelectedShopId(e.target.value || null)}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">+ Add New Shop</option>
                  {userShops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
                {!isNewShop && !editMode && (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {selectedShopId && !editMode ? (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{shopData.name}</h2>
                <div className="space-y-3">
                  <p className="flex items-start gap-2 text-gray-700">
                    <MapPin size={18} className="text-gray-500 shrink-0 mt-1" />
                    <span>{shopData.address}</span>
                  </p>
                  {shopData.phone && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Phone:</span> {shopData.phone}
                    </p>
                  )}
                  {shopData.maps_link && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Maps:</span>
                      <a 
                        href={shopData.maps_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        View on Google Maps
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Medicines Stock</h2>
                </div>

                {shopMedicines.length > 0 ? (
                  <div className="space-y-4">
                    {shopMedicines.map((medicine) => (
                      <div key={medicine.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{medicine.name}</h3>
                            {medicine.description && (
                              <p className="text-gray-600 text-sm">{medicine.description}</p>
                            )}
                            <p className="text-gray-800 mt-1">Price: ₹{medicine.price}</p>
                          </div>
                          <div className="text-right">
                            {editingMedicine === medicine.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  className="w-24"
                                  value={medicine.stock_quantity}
                                  onChange={(e) => {
                                    const updatedMedicines = shopMedicines.map(med => 
                                      med.id === medicine.id 
                                        ? {...med, stock_quantity: e.target.value} 
                                        : med
                                    );
                                    setShopMedicines(updatedMedicines);
                                  }}
                                  min="0"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => updateMedicineStock(medicine.id!, medicine.stock_quantity)}
                                  disabled={updatingStock}
                                >
                                  <Save size={16} />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <div className="mb-1">
                                  <span className="font-medium">Stock:</span> 
                                  <span className={parseInt(medicine.stock_quantity) > 10 ? "text-green-600" : "text-red-600"}>
                                    {" "}{medicine.stock_quantity}
                                  </span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditingMedicine(medicine.id)}
                                >
                                  Update Stock
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No medicines found for this shop</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
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

              {isNewShop && (
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
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  isNewShop ? "Adding Shop & Medicines..." : "Updating Shop..."
                ) : (
                  isNewShop ? "Add Shop & Medicines" : "Update Shop"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddShop;
