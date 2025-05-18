import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  shop: string;
  shopId: string | null;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load cart items from localStorage
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error loading cart items:", error);
        toast({
          title: "Error",
          description: "Failed to load your cart items",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
    
    // Clear the cart to remove all "Add to Cart" functionality
    localStorage.removeItem('cart');
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Place order
  const placeOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the order to a backend
    // For now, we'll just clear the cart and show a success message
    setCartItems([]);
    localStorage.removeItem('cart');
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your order. It has been received and is being processed.",
    });
  };

  // Group items by shop
  const itemsByShop: { [shopName: string]: CartItem[] } = {};
  cartItems.forEach(item => {
    if (!itemsByShop[item.shop]) {
      itemsByShop[item.shop] = [];
    }
    itemsByShop[item.shop].push(item);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <ShoppingCart className="mr-2" />
            Your Cart
          </h1>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                The Add to Cart functionality has been removed from this application.
              </p>
              <Button asChild>
                <a href="/#search-section">Browse Medicines</a>
              </Button>
            </div>
          ) : (
            
            <div className="space-y-6">
              {Object.entries(itemsByShop).map(([shopName, items]) => (
                <div key={shopName} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-medical-50 px-6 py-3">
                    <h2 className="font-semibold text-medical-700">{shopName}</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-medical-600 font-medium mt-1">₹{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-medical-700">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
