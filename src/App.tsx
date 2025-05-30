
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Stores from "./pages/Stores";
import Doctors from "./pages/Doctors";
import AddShop from "./pages/AddShop";
import AddMedicine from "./pages/AddMedicine";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ShopInventory from "./pages/ShopInventory";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/add-shop" 
              element={
                <ProtectedRoute>
                  <AddShop />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-medicine" 
              element={
                <ProtectedRoute>
                  <AddMedicine />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop-inventory/:shopId" 
              element={
                <ProtectedRoute>
                  <ShopInventory />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
