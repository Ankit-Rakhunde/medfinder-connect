
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { SearchResults } from "./SearchResults";
import { LocationDetails } from "./LocationDetector";

interface MedicineSearchProps {
  userLocation: LocationDetails | null;
  onSearch: (query: string) => void;
  searchResults: any[] | null;
  isLoading: boolean;
}

export const MedicineSearch = ({ 
  userLocation, 
  onSearch, 
  searchResults, 
  isLoading 
}: MedicineSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout(Number(localStorage.getItem('searchTimeout')));
    const timeoutId = setTimeout(() => onSearch(value), 500);
    localStorage.setItem('searchTimeout', timeoutId.toString());
  };

  return (
    <div id="search-section" className="relative max-w-2xl mx-auto">
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
          <SearchResults 
            searchQuery={searchQuery}
            searchResults={searchResults}
            isLoading={isLoading}
            userLocation={userLocation}
          />
        </motion.div>
      )}
    </div>
  );
};
