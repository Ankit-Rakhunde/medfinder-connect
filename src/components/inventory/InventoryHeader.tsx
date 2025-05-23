
import { Pill, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface InventoryHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const InventoryHeader = ({ searchTerm, setSearchTerm }: InventoryHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Pill className="h-5 w-5" /> 
        Medicine Inventory
      </h2>

      <div className="flex gap-2 w-full md:w-auto">
        <Input 
          type="search" 
          placeholder="Search medicines..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
        <Button asChild>
          <Link to="/add-shop">
            <Plus className="h-4 w-4 mr-1" />
            Add Medicine
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
