
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Medicine {
  id?: string;
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

interface MedicineFieldsProps {
  medicines: Medicine[];
  handleMedicineChange: (index: number, field: keyof Medicine, value: string) => void;
  addMedicineField: () => void;
  removeMedicineField: (index: number) => void;
}

const MedicineFields = ({
  medicines,
  handleMedicineChange,
  addMedicineField,
  removeMedicineField,
}: MedicineFieldsProps) => {
  return (
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
  );
};

export default MedicineFields;
