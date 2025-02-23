import { useState } from "react";
import { Search, MapPin, Phone, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  medicine: {
    name: string;
    price: number;
    stock_quantity: number;
  };
  shop: {
    name: string;
    address: string;
    phone: string | null;
  };
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout(Number(localStorage.getItem('searchTimeout')));
    const timeoutId = setTimeout(() => setDebouncedQuery(value), 500);
    localStorage.setItem('searchTimeout', timeoutId.toString());
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['medicineSearch', debouncedQuery],
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
            phone
          )
        `)
        .ilike('name', `%${debouncedQuery}%`);

      if (error) throw error;
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

          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for medicines..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-6 py-4 text-lg border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-medical-500 text-white p-3 rounded-full hover:bg-medical-600 transition-colors">
                <Search size={24} />
              </button>
            </div>
            
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-10"
              >
                {isLoading ? (
                  <div className="p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{result.name}</h3>
                          <span className="text-medical-600 font-medium">
                            ₹{result.price.toFixed(2)}
                          </span>
                        </div>
                        {result.shops && (
                          <div className="text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <MapPin size={16} />
                              {result.shops.name} - {result.shops.address}
                            </p>
                            {result.shops.phone && (
                              <p className="flex items-center gap-1 mt-1">
                                <Phone size={16} />
                                {result.shops.phone}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              Stock available: {result.stock_quantity}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No medicines found matching your search
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="text-medical-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search Medicines</h3>
              <p className="text-gray-600">Find medicines quickly with our smart search system.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MapPin className="text-medical-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Locate Stores</h3>
              <p className="text-gray-600">Find nearby medical stores with real-time availability.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Phone className="text-medical-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Doctor Consult</h3>
              <p className="text-gray-600">Connect with qualified doctors for expert advice.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
