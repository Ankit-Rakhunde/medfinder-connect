
import { useState } from "react";
import { Save, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddMedicineForm from "./AddMedicineForm";

interface Medicine {
  id?: string;
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

interface MedicineListProps {
  shopMedicines: Medicine[];
  setShopMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  selectedShopId: string | null;
  updateMedicineStock: (medicineId: string, newStock: string) => void;
  removeMedicineFromShop: (medicineId: string) => void;
  updatingStock: boolean;
  removingMedicine: boolean;
  loading: boolean;
  newMedicine: Medicine;
  handleNewMedicineChange: (field: keyof Medicine, value: string) => void;
  addNewMedicineToShop: () => void;
  addingNewMedicine: boolean;
  setAddingNewMedicine: React.Dispatch<React.SetStateAction<boolean>>;
}

const MedicineList = ({
  shopMedicines,
  setShopMedicines,
  selectedShopId,
  updateMedicineStock,
  removeMedicineFromShop,
  updatingStock,
  removingMedicine,
  loading,
  newMedicine,
  handleNewMedicineChange,
  addNewMedicineToShop,
  addingNewMedicine,
  setAddingNewMedicine,
}: MedicineListProps) => {
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Medicines Stock</h2>
        <Button
          onClick={() => setAddingNewMedicine(true)}
          className="gap-2"
        >
          <Plus size={16} />
          Add Medicine
        </Button>
      </div>

      {addingNewMedicine && (
        <AddMedicineForm
          newMedicine={newMedicine}
          handleNewMedicineChange={handleNewMedicineChange}
          addNewMedicineToShop={addNewMedicineToShop}
          setAddingNewMedicine={setAddingNewMedicine}
          loading={loading}
        />
      )}

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
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingMedicine(medicine.id)}
                        >
                          Update Stock
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeMedicineFromShop(medicine.id!)}
                          disabled={removingMedicine}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
  );
};

export default MedicineList;
