// import { useState } from "react";
// import axios from "axios";
// import { Button } from "src/components/ui/button";
// import { Input } from "src/components/ui/input";
// import { Label } from "src/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "src/components/ui/dialog";
// import { useToast } from "src/hooks/use-toast";

// interface RegistrationFormProps {
//   event: { id: string; title: string; type: string };
//   onSuccess: () => void;
//   onClose: () => void;
// }

// export default function RegistrationForm({
//   event,
//   onSuccess,
//   onClose,
// }: RegistrationFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("esewa");
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//   });
//   const { toast } = useToast();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!event.id.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Invalid event ID. Please refresh and try again.",
//       });
//       return false;
//     }
//     if (!formData.name.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Name is required.",
//       });
//       return false;
//     }
//     if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Please provide a valid email address.",
//       });
//       return false;
//     }
//     if (!formData.phone.match(/^\d{10,15}$/)) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Phone number must be between 10 and 15 digits.",
//       });
//       return false;
//     }
//     if (event.type.toLowerCase() === "premium" && !paymentMethod) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Please select a payment method.",
//       });
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);

//     const registrationData = {
//       eventId: event.id,
//       name: formData.name,
//       email: formData.email,
//       phone: formData.phone,
//       paymentMethod:
//         event.type.toLowerCase() === "premium" ? paymentMethod : undefined,
//     };

//     try {
//       const { data } = await axios.post(
//         "/api/events/register",
//         registrationData
//       );

//       if (data.paymentUrl) {
//         window.location.href = data.paymentUrl;
//       } else {
//         toast({
//           title: "Success",
//           description: "You have successfully registered for the event.",
//         });
//         onSuccess();
//       }
//     } catch (error: any) {
//       const message =
//         error.response?.data?.error || error.message || "Registration failed.";
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={true} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md p-6">
//         <DialogHeader>
//           <DialogTitle>Register for {event.title}</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter your name"
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="phone">Phone</Label>
//             <Input
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="Enter your phone number"
//               required
//             />
//           </div>

//           {event.type.toLowerCase() === "premium" && (
//             <div>
//               <Label>Payment Method</Label>
//               <div className="flex space-x-4">
//                 <label>
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="esewa"
//                     checked={paymentMethod === "esewa"}
//                     onChange={() => setPaymentMethod("esewa")}
//                   />
//                   eSewa
//                 </label>
//                 <label>
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="khalti"
//                     checked={paymentMethod === "khalti"}
//                     onChange={() => setPaymentMethod("khalti")}
//                   />
//                   Khalti
//                 </label>
//               </div>
//             </div>
//           )}

//           <Button type="submit" disabled={loading} className="w-full">
//             {loading ? "Processing..." : "Register"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import { useToast } from "src/hooks/use-toast";

interface RegistrationFormProps {
  event: { id: string; title: string; type: string; price?: string };
  onSuccess: () => void;
  onClose: () => void;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RegistrationForm({
  event,
  onSuccess,
  onClose,
  submitting,
  setSubmitting,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const { toast } = useToast();

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name is required.",
      });
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a valid email address.",
      });
      return false;
    }
    if (!formData.phone.match(/^\d{10,15}$/)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Phone number must be between 10 and 15 digits.",
      });
      return false;
    }
    if (event.type.toLowerCase() === "premium" && !paymentMethod) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a payment method.",
      });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (event.type.toLowerCase() === "premium") {
        // First, save the registration record with paymentStatus = PENDING
        await registerForPaidEvent();
        // Then, initiate payment for premium events
        await initiatePayment(paymentMethod, event.price || "0", event.id);
      } else {
        // For free events, register the user directly
        await registerForEvent();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Initiate payment for eSewa or Khalti
  const initiatePayment = async (
    method: string,
    amount: string,
    eventId: string
  ) => {
    try {
      const response = await fetch(`/api/initiate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount,
          productName: event.title,
          transactionId: `txn_${Date.now()}_${eventId}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || `${method.toUpperCase()} payment initiation failed.`
        );
      }

      // Redirect to the respective payment gateway
      window.location.href =
        method === "esewa" ? data.esewaPaymentUrl : data.khaltiPaymentUrl;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  // Register directly for free events
  const registerForEvent = async () => {
    const response = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed.");
    }

    toast({
      title: "Success",
      description: "You have successfully registered for the event.",
    });
    onSuccess();
  };

  //register for paid event
  const registerForPaidEvent = async () => {
    const response = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // For premium events, paymentMethod is included
        paymentMethod:
          event.type.toLowerCase() === "premium" ? paymentMethod : "pending",
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed.");
    }
    // Optionally, process the returned registration data if needed.
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
              placeholder="Enter your name"
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
              placeholder="Enter your email"
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
              placeholder="Enter your phone number"
              required
            />
          </div>

          {event.type.toLowerCase() === "premium" && (
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
                    checked={paymentMethod === "khalti"}
                    onChange={() => setPaymentMethod("khalti")}
                  />
                  Khalti
                </label>
              </div>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Processing..." : "Register"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
