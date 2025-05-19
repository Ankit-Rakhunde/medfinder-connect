
import { Link } from "react-router-dom";
import { User, Search, MapPin, Phone, Plus, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Scroll to search section on home page
    if (window.location.pathname !== '/') {
      window.location.href = '/#search-section';
    } else {
      const searchElement = document.getElementById('search-section');
      if (searchElement) {
        searchElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold text-medical-800">
            MedFinder
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <a 
              href="/#search-section" 
              className="flex items-center space-x-1 text-gray-600 hover:text-medical-600 transition-colors"
              onClick={handleSearchClick}
            >
              <Search size={18} />
              <span>Search</span>
            </a>
            <Link to="/stores" className="flex items-center space-x-1 text-gray-600 hover:text-medical-600 transition-colors">
              <MapPin size={18} />
              <span>Stores</span>
            </Link>
            <Link to="/doctors" className="flex items-center space-x-1 text-gray-600 hover:text-medical-600 transition-colors">
              <Phone size={18} />
              <span>Doctors</span>
            </Link>
            <Link to="/add-shop" className="flex items-center space-x-1">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus size={18} />
                Add Shop
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-600 hover:text-medical-600 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full bg-medical-100">
                    <User size={20} className="text-medical-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-shops" className="cursor-pointer w-full">
                      My Shops
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu - slide down when open */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 animate-slideUp">
            <div className="flex flex-col space-y-4">
              <a
                href="/#search-section"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-medical-600"
                onClick={handleSearchClick}
              >
                <Search size={18} />
                <span>Search</span>
              </a>
              <Link
                to="/stores"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-medical-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin size={18} />
                <span>Stores</span>
              </Link>
              <Link
                to="/doctors"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-medical-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone size={18} />
                <span>Doctors</span>
              </Link>
              <Link
                to="/add-shop"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-medical-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plus size={18} />
                <span>Add Shop</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
