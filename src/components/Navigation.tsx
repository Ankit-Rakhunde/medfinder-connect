
import { Link } from "react-router-dom";
import { ShoppingCart, User, Search, MapPin, Phone, Plus, LogOut } from "lucide-react";
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

const Navigation = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold text-medical-800">
            MedFinder
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/search" className="flex items-center space-x-1 text-gray-600 hover:text-medical-600 transition-colors">
              <Search size={18} />
              <span>Search</span>
            </Link>
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
            <Link to="/cart" className="relative text-gray-600 hover:text-medical-600 transition-colors">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-medical-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            
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
      </div>
    </nav>
  );
};

export default Navigation;
