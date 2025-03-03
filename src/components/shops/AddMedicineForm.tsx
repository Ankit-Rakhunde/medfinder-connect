
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [errors, setErrors] = useState<Partial<Record<keyof Medicine, string>>>({});
  
  const validateForm = () => {
    const newErrors: Partial<Record<keyof Medicine, string>> = {};
    let isValid = true;
    
    if (!newMedicine.name.trim()) {
      newErrors.name = "Medicine name is required";
      isValid = false;
    }
    
    if (!newMedicine.price.trim()) {
      newErrors.price = "Price is required";
      isValid = false;
    } else if (isNaN(Number(newMedicine.price)) || Number(newMedicine.price) <= 0) {
      newErrors.price = "Price must be a positive number";
      isValid = false;
    }
    
    if (!newMedicine.stock_quantity.trim()) {
      newErrors.stock_quantity = "Stock quantity is required";
      isValid = false;
    } else if (isNaN(Number(newMedicine.stock_quantity)) || Number(newMedicine.stock_quantity) < 0 || !Number.isInteger(Number(newMedicine.stock_quantity))) {
      newErrors.stock_quantity = "Stock quantity must be a non-negative whole number";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      addNewMedicineToShop();
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white mb-6">
      <h3 className="font-medium text-lg mb-4">Add New Medicine</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicine Name <span className="text-red-500">*</span>
          </label>
          <Input
            required
            value={newMedicine.name}
            onChange={(e) => {
              handleNewMedicineChange("name", e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="Medicine name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
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
            Price <span className="text-red-500">*</span>
          </label>
          <Input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={newMedicine.price}
            onChange={(e) => {
              handleNewMedicineChange("price", e.target.value);
              if (errors.price) setErrors({ ...errors, price: undefined });
            }}
            placeholder="Price"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <Input
            required
            type="number"
            min="0"
            value={newMedicine.stock_quantity}
            onChange={(e) => {
              handleNewMedicineChange("stock_quantity", e.target.value);
              if (errors.stock_quantity) setErrors({ ...errors, stock_quantity: undefined });
            }}
            placeholder="Quantity"
            className={errors.stock_quantity ? "border-red-500" : ""}
          />
          {errors.stock_quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.stock_quantity}</p>
          )}
        </div>
      </div>
      
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors above before submitting.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setAddingNewMedicine(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Medicine"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddMedicineForm;
