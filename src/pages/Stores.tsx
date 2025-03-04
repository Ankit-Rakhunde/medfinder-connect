
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Store, Building2, PackageSearch, ShoppingBag, MapPin, 
  Phone, ExternalLink, Filter, Layers, GripVertical
} from "lucide-react";
import Navigation from "../components/Navigation";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Stores = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("grid");

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shops").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (stores) {
      let filtered = [...stores];
      
      // Apply category filter
      if (activeCategory !== "all") {
        // This is a placeholder for category filtering
        // In a real app, you would filter based on store categories
      }
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (store) =>
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredStores(filtered);
    }
  }, [stores, searchTerm, activeCategory]);

  // Generate a Google Maps link if we have coordinates but no explicit maps_link
  const getGoogleMapsLink = (shop: any) => {
    if (shop.maps_link) return shop.maps_link;
    
    if (shop.latitude && shop.longitude) {
      return `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`;
    }
    
    return null;
  };

  const categories = [
    { id: "all", name: "All Stores", icon: Store },
    { id: "pharmacy", name: "Pharmacies", icon: Building2 },
    { id: "ayurvedic", name: "Ayurvedic", icon: PackageSearch },
    { id: "general", name: "General Stores", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <SidebarProvider>
        <div className="flex w-full min-h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <Sidebar className="border-r">
            <SidebarHeader className="px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Store className="h-5 w-5" />
                <span>Store Directory</span>
              </h2>
            </SidebarHeader>
            
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Categories</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {categories.map((category) => (
                      <SidebarMenuItem key={category.id}>
                        <SidebarMenuButton 
                          onClick={() => setActiveCategory(category.id)}
                          className={activeCategory === category.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                        >
                          <category.icon className="h-5 w-5" />
                          <span>{category.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>View Options</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                      >
                        <Layers className="h-5 w-5" />
                        <span>Grid View</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                      >
                        <GripVertical className="h-5 w-5" />
                        <span>List View</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="p-6">
              <Button 
                className="w-full"
                onClick={() => navigate("/add-shop")}
              >
                Register Your Store
              </Button>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container py-8 px-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Medical Stores</h1>
                  <p className="text-gray-600 mt-1">
                    Find pharmacies and medical stores near you
                  </p>
                </div>
                
                <div className="relative w-full md:w-80">
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search by name or location"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-6" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-700">
                  {isLoading ? "Loading stores..." : 
                   filteredStores.length === 0 ? "No stores found" : 
                   `${filteredStores.length} stores found`}
                </h2>
                
                <div className="flex gap-2 md:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-primary/10" : ""}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-primary/10" : ""}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <SidebarTrigger />
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} className="animate-pulse">
                      <CardHeader className="bg-gray-100 h-32"></CardHeader>
                      <CardContent className="pt-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="text-center py-16">
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No stores found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search or filter parameters</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStores.map((store) => {
                    const mapsLink = getGoogleMapsLink(store);
                    return (
                      <Card key={store.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl flex justify-between items-start">
                            <span>{store.name}</span>
                          </CardTitle>
                          {store.description && (
                            <CardDescription>{store.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin size={18} className="text-gray-500 shrink-0 mt-1" />
                            <span className="text-gray-700">{store.address}</span>
                          </div>
                          {store.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={18} className="text-gray-500" />
                              <a href={`tel:${store.phone}`} className="text-gray-700 hover:text-medical-600 transition-colors">
                                {store.phone}
                              </a>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t pt-4 flex justify-between">
                          {mapsLink ? (
                            <Button variant="outline" size="sm" asChild className="gap-1 text-blue-600">
                              <a 
                                href={mapsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <MapPin size={14} />
                                View on Maps
                                <ExternalLink size={12} />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">No map available</span>
                          )}
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-medical-600 hover:bg-medical-700"
                            onClick={() => navigate(`/stores/${store.id}`)}
                          >
                            View Products
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStores.map((store) => {
                    const mapsLink = getGoogleMapsLink(store);
                    return (
                      <div key={store.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                          {store.description && (
                            <p className="text-gray-600 text-sm mt-1">{store.description}</p>
                          )}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin size={18} className="text-gray-500 shrink-0 mt-1" />
                              <span className="text-gray-700">{store.address}</span>
                            </div>
                            {store.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={18} className="text-gray-500" />
                                <a href={`tel:${store.phone}`} className="text-gray-700 hover:text-medical-600 transition-colors">
                                  {store.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center gap-3 justify-end">
                          {mapsLink ? (
                            <Button variant="outline" size="sm" asChild className="gap-1 text-blue-600">
                              <a 
                                href={mapsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <MapPin size={14} />
                                Maps
                                <ExternalLink size={12} />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">No map available</span>
                          )}
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-medical-600 hover:bg-medical-700"
                            onClick={() => navigate(`/stores/${store.id}`)}
                          >
                            View Products
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Stores;
