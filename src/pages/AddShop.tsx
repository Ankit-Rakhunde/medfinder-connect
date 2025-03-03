
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import ShopDetailsForm from "@/components/shops/ShopDetailsForm";
import MedicineFields from "@/components/shops/MedicineFields";
import ShopSelector from "@/components/shops/ShopSelector";
import ShopDetailsDisplay from "@/components/shops/ShopDetailsDisplay";
import MedicineList from "@/components/shops/MedicineList";

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

  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isNewShop, setIsNewShop] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [shopMedicines, setShopMedicines] = useState<Medicine[]>([]);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [addingNewMedicine, setAddingNewMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState<Medicine>({ 
    name: "", 
    description: "", 
    price: "", 
    stock_quantity: "" 
  });
  const [removingMedicine, setRemovingMedicine] = useState(false);

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
            
            const area = data.address.suburb || 
                        data.address.neighbourhood || 
                        data.address.residential || 
                        data.address.city_district ||
                        data.address.city ||
                        "Unknown Area";
                        
            const pincode = data.address.postcode || "Unknown Pincode";

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
        
        await fetchUserShops();
        setSelectedShopId(shopResult.id);
      } else if (editMode) {
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

      if (selectedShopId) {
        await fetchShopMedicines(selectedShopId);
      }
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

  const addNewMedicineToShop = async () => {
    if (!selectedShopId) return;
    
    if (!newMedicine.name || !newMedicine.price || !newMedicine.stock_quantity) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          shop_id: selectedShopId,
          name: newMedicine.name,
          description: newMedicine.description,
          price: parseFloat(newMedicine.price),
          stock_quantity: parseInt(newMedicine.stock_quantity),
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Medicine has been added to your shop."
      });

      fetchShopMedicines(selectedShopId);
      
      setNewMedicine({ 
        name: "", 
        description: "", 
        price: "", 
        stock_quantity: "" 
      });
      
      setAddingNewMedicine(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding medicine",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const removeMedicineFromShop = async (medicineId: string) => {
    if (!confirm("Are you sure you want to remove this medicine?")) {
      return;
    }
    
    setRemovingMedicine(true);
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', medicineId);

      if (error) throw error;

      toast({
        title: "Medicine removed",
        description: "The medicine has been removed from your shop."
      });

      if (selectedShopId) {
        fetchShopMedicines(selectedShopId);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing medicine",
        description: error.message
      });
    } finally {
      setRemovingMedicine(false);
    }
  };

  const handleNewMedicineChange = (field: keyof Medicine, value: string) => {
    setNewMedicine(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isNewShop ? "Add New Shop" : "Manage Shop"}
          </h1>

          <ShopSelector
            userShops={userShops}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            isNewShop={isNewShop}
            editMode={editMode}
            setEditMode={setEditMode}
          />
          
          {selectedShopId && !editMode ? (
            <div className="space-y-8">
              <ShopDetailsDisplay shopData={shopData} />

              <MedicineList
                shopMedicines={shopMedicines}
                setShopMedicines={setShopMedicines}
                selectedShopId={selectedShopId}
                updateMedicineStock={updateMedicineStock}
                removeMedicineFromShop={removeMedicineFromShop}
                updatingStock={updatingStock}
                removingMedicine={removingMedicine}
                loading={loading}
                newMedicine={newMedicine}
                handleNewMedicineChange={handleNewMedicineChange}
                addNewMedicineToShop={addNewMedicineToShop}
                addingNewMedicine={addingNewMedicine}
                setAddingNewMedicine={setAddingNewMedicine}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <ShopDetailsForm
                shopData={shopData}
                setShopData={setShopData}
                locationDetails={locationDetails}
                locationLoading={locationLoading}
                getCurrentLocation={getCurrentLocation}
              />

              {isNewShop && (
                <MedicineFields
                  medicines={medicines}
                  handleMedicineChange={handleMedicineChange}
                  addMedicineField={addMedicineField}
                  removeMedicineField={removeMedicineField}
                />
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
