
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Plus, Minus } from "lucide-react";

interface Medicine {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

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

  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", description: "", price: "", stock_quantity: "" }
  ]);

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
      // First, insert the shop
      const { data: shopResult, error: shopError } = await supabase
        .from('shops')
        .insert([shopData])
        .select()
        .single();

      if (shopError) throw shopError;

      // Then, insert the medicines with the shop_id
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
