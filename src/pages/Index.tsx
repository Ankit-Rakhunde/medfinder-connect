
import { useState } from "react";
import { Search, MapPin, Phone } from "lucide-react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <div className="p-4">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
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
