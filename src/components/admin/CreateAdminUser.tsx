
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateAdminUser = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@medfinder.com");
  const [password, setPassword] = useState("admin123");
  const [firstName, setFirstName] = useState("Admin");
  const [lastName, setLastName] = useState("User");

  const createAdminUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_admin_user', {
        email_input: email,
        password_input: password,
        first_name_input: firstName,
        last_name_input: lastName
      });

      if (error) throw error;

      toast({
        title: "Admin user created successfully!",
        description: `Email: ${email}, Password: ${password}`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating admin user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
        <CardDescription>Create an admin account for system management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <Button 
          onClick={createAdminUser} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating..." : "Create Admin User"}
        </Button>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Default Admin Credentials:</strong><br />
            Email: admin@medfinder.com<br />
            Password: admin123
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAdminUser;
