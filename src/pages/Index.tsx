
import { useState } from "react";
import { Search, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LocationDetector, LocationDetails } from "@/components/search/LocationDetector";
import { MedicineSearch } from "@/components/search/MedicineSearch";
import { FeatureCard } from "@/components/search/FeatureCard";
import { useLocationDetection } from "@/hooks/useLocationDetection";

const Index = () => {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { 
    userLocation,
    setUserLocation,
    isLoadingLocation,
    setIsLoadingLocation
  } = useLocationDetection();

  const handleSearch = (query: string) => {
    setDebouncedQuery(query);
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['medicineSearch', debouncedQuery, userLocation?.latitude, userLocation?.longitude],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('medicines')
        .select(`
          name,
          price,
          stock_quantity,
          shops (
            name,
            address,
            phone,
            latitude,
            longitude,
            maps_link
          )
        `)
        .ilike('name', `%${debouncedQuery}%`);

      if (error) {
        console.error("Search error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: debouncedQuery.length > 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Find Medicine Near You
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Search for medicines, locate nearby stores, and order online with ease.
          </p>

          <LocationDetector 
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            isLoadingLocation={isLoadingLocation}
            setIsLoadingLocation={setIsLoadingLocation}
          />

          <MedicineSearch 
            userLocation={userLocation}
            onSearch={handleSearch}
            searchResults={searchResults}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FeatureCard 
              icon={Search}
              title="Search Medicines"
              description="Find medicines quickly with our smart search system."
            />
            
            <FeatureCard 
              icon={MapPin}
              title="Locate Stores"
              description="Find nearby medical stores with real-time availability."
            />
            
            <FeatureCard 
              icon={Phone}
              title="Doctor Consult"
              description="Connect with qualified doctors for expert advice."
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
