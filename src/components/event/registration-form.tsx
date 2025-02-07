import { useState } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";

interface RegistrationFormProps {
  event: { id: string; title: string; type: string };
  onSuccess: () => void;
  onClose: () => void;
}

export default function RegistrationForm({
  event,
  onSuccess,
  onClose,
}: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const registrationData: any = {
      eventId: event.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      paymentMethod,
    };

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Registration failed");

      if (responseData.paymentUrl) {
        window.location.href = responseData.paymentUrl;
      } else {
        onSuccess();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {event.type === "premium" && (
            <div>
              <Label>Payment Method</Label>
              <div className="flex space-x-4">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="esewa"
                    checked={paymentMethod === "esewa"}
                    onChange={() => setPaymentMethod("esewa")}
                  />
                  eSewa
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="khalti"
                    onChange={() => setPaymentMethod("khalti")}
                  />
                  Khalti
                </label>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
