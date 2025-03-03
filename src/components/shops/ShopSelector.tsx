
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  maps_link: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ShopSelectorProps {
  userShops: Shop[];
  selectedShopId: string | null;
  setSelectedShopId: (id: string | null) => void;
  isNewShop: boolean;
  editMode: boolean;
  setEditMode: (edit: boolean) => void;
}

const ShopSelector = ({
  userShops,
  selectedShopId,
  setSelectedShopId,
  isNewShop,
  editMode,
  setEditMode,
}: ShopSelectorProps) => {
  if (userShops.length === 0) {
    return null;
  }

  return (
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
  );
};

export default ShopSelector;
