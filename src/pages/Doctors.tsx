
import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Star, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  hours: string;
  experience: string;
  image: string;
}

interface LocationDetails {
  area: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  date: z.date({ required_error: "Please select a date for your appointment." }),
  time: z.string({ required_error: "Please select a time slot." }),
  reason: z.string().min(5, { message: "Please provide a reason for your visit." }).max(200, { message: "Reason must be less than 200 characters." })
});

type FormValues = z.infer<typeof formSchema>;

const Doctors = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userLocation, setUserLocation] = useState<LocationDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      reason: ""
    }
  });

  // Available time slots
  const availableTimeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
    "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log("Appointment data:", data, "Doctor:", selectedDoctor);
    
    // Close the dialog
    setIsBookingOpen(false);
    
    // Reset the form
    form.reset();
    
    // Show success toast
    toast({
      title: "Appointment Booked Successfully!",
      description: `Your appointment with ${selectedDoctor?.name} is scheduled for ${format(data.date, "PPP")} at ${data.time}.`,
      variant: "default",
    });
  };

  // Open booking dialog with selected doctor
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingOpen(true);
  };

  // Sample doctor data
  const sampleDoctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      address: "123 Medical Center Ave, Suite 101",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@medclinic.com",
      rating: 4.8,
      hours: "Mon-Fri: 9AM-5PM",
      experience: "15 years",
      image: "/placeholder.svg"
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Pediatrician",
      address: "456 Children's Health Blvd",
      phone: "+1 (555) 987-6543",
      email: "michael.chen@medclinic.com",
      rating: 4.9,
      hours: "Mon-Sat: 8AM-7PM",
      experience: "12 years",
      image: "/placeholder.svg"
    },
    {
      id: "3",
      name: "Dr. James Wilson",
      specialty: "Orthopedic Surgeon",
      address: "789 Bone & Joint Street",
      phone: "+1 (555) 456-7890",
      email: "james.wilson@medclinic.com",
      rating: 4.7,
      hours: "Tue-Sat: 10AM-6PM",
      experience: "20 years",
      image: "/placeholder.svg"
    },
    {
      id: "4",
      name: "Dr. Emily Patel",
      specialty: "Dermatologist",
      address: "321 Skin Care Lane",
      phone: "+1 (555) 234-5678",
      email: "emily.patel@medclinic.com",
      rating: 4.6,
      hours: "Mon-Fri: 9AM-4PM",
      experience: "8 years",
      image: "/placeholder.svg"
    },
    {
      id: "5",
      name: "Dr. Robert Garcia",
      specialty: "General Practitioner",
      address: "567 Family Medicine Road",
      phone: "+1 (555) 345-6789",
      email: "robert.garcia@medclinic.com",
      rating: 4.5,
      hours: "Mon-Sun: 8AM-8PM",
      experience: "10 years",
      image: "/placeholder.svg"
    }
  ];

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    toast({
      title: "Getting your location",
      description: "Please wait while we detect your location...",
    });
    
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            console.log("Raw coordinates:", latitude, longitude);
            
            // Try Google Geocoding API first
            try {
              const googleResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`
              );
              
              if (googleResponse.ok) {
                const googleData = await googleResponse.json();
                if (googleData.results && googleData.results.length > 0) {
                  const addressComponents = googleData.results[0].address_components;
                  const area = addressComponents.find(
                    (component: any) => 
                      component.types.includes("sublocality") || 
                      component.types.includes("locality")
                  )?.long_name || "Unknown Area";
                  
                  const pincode = addressComponents.find(
                    (component: any) => component.types.includes("postal_code")
                  )?.long_name || "Unknown Pincode";
                  
                  setUserLocation({
                    area,
                    pincode,
                    latitude,
                    longitude
                  });
                  
                  toast({
                    title: "Location detected",
                    description: `${area}, ${pincode}`,
                  });
                  setIsLoadingLocation(false);
                  return;
                }
              }
            } catch (googleError) {
              console.error("Google Geocoding API error:", googleError);
              // Fall back to OpenStreetMap
            }
            
            // Fallback to OpenStreetMap
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&lat=${latitude}&lon=${longitude}&` +
              `addressdetails=1&zoom=18&accept-language=en`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch location details');
            }

            const data = await response.json();
            console.log("Location data from OpenStreetMap API:", data);
            
            const area = data.address.suburb || 
                        data.address.neighbourhood || 
                        data.address.residential || 
                        data.address.city_district ||
                        data.address.city ||
                        "Unknown Area";
                        
            const pincode = data.address.postcode || "Unknown Pincode";
            
            setUserLocation({
              area,
              pincode,
              latitude,
              longitude
            });

            toast({
              title: "Location detected",
              description: `${area}, ${pincode}`,
            });
          } catch (error) {
            console.error("Error getting location details:", error);
            
            setUserLocation({
              area: "Unknown Area",
              pincode: "Unknown Pincode",
              latitude: latitude,
              longitude: longitude
            });
            
            toast({
              variant: "destructive",
              title: "Error getting detailed location",
              description: "Using coordinates for search. Please try again later.",
            });
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          setIsLoadingLocation(false);
          console.error("Geolocation error:", error);
          
          let errorMessage = "Could not get your location";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please enable location services in your browser";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          toast({
            variant: "destructive",
            title: "Error getting location",
            description: errorMessage,
          });
        },
        options
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
      });
    }
  };

  useEffect(() => {
    // Load sample doctors
    setDoctors(sampleDoctors);
    
    // Get user location
    getCurrentLocation();
  }, []);

  // Function to render stars for ratings
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />);
      } else {
        stars.push(<Star key={i} className="text-gray-300" size={16} />);
      }
    }
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">{stars}</div>
        <span className="text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Local Doctors
              </h1>
              <p className="text-lg text-gray-600">
                Find and connect with qualified doctors near you
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 p-3 bg-gray-50 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-medical-600" />
                {isLoadingLocation ? (
                  <span>Detecting your location...</span>
                ) : userLocation ? (
                  <>
                    <span>{userLocation.area}, {userLocation.pincode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="text-medical-600 hover:text-medical-700"
                      disabled={isLoadingLocation}
                    >
                      Update
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Location not detected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="text-medical-600 hover:text-medical-700"
                      disabled={isLoadingLocation}
                    >
                      Detect Location
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: parseInt(doctor.id) * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-medical-600 font-medium">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500 mt-1">{doctor.experience} experience</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    {renderRatingStars(doctor.rating)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      {doctor.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {doctor.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {doctor.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {doctor.hours}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex space-x-2">
                    <Button className="w-full" onClick={() => handleBookAppointment(doctor)}>Book Appointment</Button>
                    <Button variant="outline" className="w-full">Contact</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Show More Doctors
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Appointment Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && (
                <div className="mt-2">
                  with <span className="font-semibold">{selectedDoctor.name}</span> - {selectedDoctor.specialty}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Appointment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTimeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your symptoms or reason for appointment"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Confirm Booking
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Doctors;
