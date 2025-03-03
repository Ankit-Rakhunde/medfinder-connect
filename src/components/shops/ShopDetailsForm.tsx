
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MapPin } from "lucide-react";

interface ShopDetailsFormProps {
  shopData: {
    name: string;
    address: string;
    phone: string;
    maps_link: string;
    latitude: number | null;
    longitude: number | null;
  };
  setShopData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      address: string;
      phone: string;
      maps_link: string;
      latitude: number | null;
      longitude: number | null;
    }>
  >;
  locationDetails: {
    area: string;
    pincode: string;
  };
  locationLoading: boolean;
  getCurrentLocation: () => void;
}

const ShopDetailsForm = ({
  shopData,
  setShopData,
  locationDetails,
  locationLoading,
  getCurrentLocation,
}: ShopDetailsFormProps) => {
  return (
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
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={locationLoading}
          className="w-full mb-4"
        >
          {locationLoading ? "Detecting Location..." : "Detect Current Location"}
        </Button>
        
        {(locationDetails.area || locationDetails.pincode || shopData.latitude) && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            {locationDetails.area && (
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-medical-600" />
                <span className="font-medium">Area:</span> {locationDetails.area}
              </p>
            )}
            {locationDetails.pincode && (
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-medical-600" />
                <span className="font-medium">Pincode:</span> {locationDetails.pincode}
              </p>
            )}
            {shopData.latitude && shopData.longitude && (
              <p className="text-xs text-gray-500">
                Coordinates: {shopData.latitude.toFixed(6)}, {shopData.longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}
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
        <label htmlFor="maps_link" className="block text-sm font-medium text-gray-700 mb-2">
          Google Maps Link
        </label>
        <Input
          id="maps_link"
          type="url"
          value={shopData.maps_link}
          onChange={(e) => setShopData(prev => ({ ...prev, maps_link: e.target.value }))}
          placeholder="Enter Google Maps link"
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
    </div>
  );
};

export default ShopDetailsForm;
