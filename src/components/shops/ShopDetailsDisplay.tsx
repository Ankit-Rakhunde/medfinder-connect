
import { MapPin, ExternalLink, Phone, Pill, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ShopDetailsDisplayProps {
  shopData: {
    id: string;
    name: string;
    address: string;
    phone: string;
    maps_link: string;
    latitude: number | null;
    longitude: number | null;
    user_id: string | null;
  };
}

const ShopDetailsDisplay = ({ shopData }: ShopDetailsDisplayProps) => {
  const { user } = useAuth();
  
  // Generate a Google Maps link if we have coordinates but no explicit maps_link
  const getGoogleMapsLink = () => {
    if (shopData.maps_link) return shopData.maps_link;
    
    if (shopData.latitude && shopData.longitude) {
      return `https://www.google.com/maps?q=${shopData.latitude},${shopData.longitude}`;
    }
    
    return null;
  };

  const mapsLink = getGoogleMapsLink();
  const isShopOwner = user && user.id === shopData.user_id;

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
            <Phone size={18} className="text-gray-500" />
            <a href={`tel:${shopData.phone}`} className="hover:text-medical-600 transition-colors">
              {shopData.phone}
            </a>
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {mapsLink && (
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <a 
                href={mapsLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600"
              >
                <MapPin size={16} />
                View on Maps
                <ExternalLink size={14} />
              </a>
            </Button>
          )}
          
          {isShopOwner && (
            <>
              <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                <Link to={`/shop-inventory/${shopData.id}`} className="text-green-600">
                  <Pill size={16} />
                  Manage Inventory
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                <Link to="/add-medicine" state={{ shopId: shopData.id }} className="text-purple-600">
                  <Plus size={16} />
                  Add Medicine
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailsDisplay;
