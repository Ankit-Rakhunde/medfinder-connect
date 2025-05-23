
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
}

interface InventoryTableProps {
  medicines: Medicine[];
  searchTerm: string;
}

const InventoryTable = ({ medicines, searchTerm }: InventoryTableProps) => {
  const filteredMedicines = medicines?.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.description &&
        medicine.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!filteredMedicines || filteredMedicines.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <Pill className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No medicines found</h3>
        <p className="mt-1 text-gray-500">
          {searchTerm
            ? "No medicines match your search criteria"
            : "Start adding medicines to your inventory"}
        </p>
        <Button asChild className="mt-4">
          <Link to="/add-shop">
            <Plus className="h-4 w-4 mr-1" />
            Add Medicine
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price (₹)</TableHead>
          <TableHead>Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMedicines.map((medicine) => (
          <TableRow key={medicine.id}>
            <TableCell className="font-medium">{medicine.name}</TableCell>
            <TableCell>{medicine.description || "—"}</TableCell>
            <TableCell>₹{medicine.price}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  medicine.stock_quantity > 10
                    ? "bg-green-100 text-green-800"
                    : medicine.stock_quantity > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {medicine.stock_quantity}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InventoryTable;
