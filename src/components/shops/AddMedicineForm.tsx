
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Medicine {
  id?: string;
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

interface AddMedicineFormProps {
  newMedicine: Medicine;
  handleNewMedicineChange: (field: keyof Medicine, value: string) => void;
  addNewMedicineToShop: () => void;
  setAddingNewMedicine: (adding: boolean) => void;
  loading: boolean;
}

const AddMedicineForm = ({
  newMedicine,
  handleNewMedicineChange,
  addNewMedicineToShop,
  setAddingNewMedicine,
  loading,
}: AddMedicineFormProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white mb-6">
      <h3 className="font-medium text-lg mb-4">Add New Medicine</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicine Name
          </label>
          <Input
            required
            value={newMedicine.name}
            onChange={(e) => handleNewMedicineChange("name", e.target.value)}
            placeholder="Medicine name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Input
            value={newMedicine.description}
            onChange={(e) => handleNewMedicineChange("description", e.target.value)}
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
            value={newMedicine.price}
            onChange={(e) => handleNewMedicineChange("price", e.target.value)}
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
            value={newMedicine.stock_quantity}
            onChange={(e) => handleNewMedicineChange("stock_quantity", e.target.value)}
            placeholder="Quantity"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setAddingNewMedicine(false)}
        >
          Cancel
        </Button>
        <Button 
          onClick={addNewMedicineToShop}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Medicine"}
        </Button>
      </div>
    </div>
  );
};

export default AddMedicineForm;
