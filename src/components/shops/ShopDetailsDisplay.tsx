
import { MapPin } from "lucide-react";

interface ShopDetailsDisplayProps {
  shopData: {
    name: string;
    address: string;
    phone: string;
    maps_link: string;
    latitude: number | null;
    longitude: number | null;
  };
}

const ShopDetailsDisplay = ({ shopData }: ShopDetailsDisplayProps) => {
  return (
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
  );
};

export default ShopDetailsDisplay;
