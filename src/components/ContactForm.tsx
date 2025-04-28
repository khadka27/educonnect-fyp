"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  problemTitle: string;
  problem: string;
}

interface ContactFormProps {
  onSuccess?: () => void;
}

// Environment variables
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export default function ContactForm({
  onSuccess,
}: ContactFormProps): JSX.Element {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    problemTitle: "",
    problem: "",
  });

  const [status, setStatus] = useState<{
    loading: boolean;
    message: string;
    error: boolean;
  }>({ loading: false, message: "", error: false });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: false });

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.problemTitle,
          message: formData.problem,
        },
        PUBLIC_KEY
      );

      setStatus({
        loading: false,
        message: "Message sent successfully!",
        error: false,
      });
      setFormData({ name: "", email: "", problemTitle: "", problem: "" });

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500); // Give user time to see success message
      }
    } catch (err) {
      console.error("EmailJS Error:", err);
      setStatus({
        loading: false,
        message: "Failed to send. Please try again.",
        error: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Your name"
          className="bg-[#0a2e29] border-[#0d9488] text-white placeholder:text-gray-400 focus:ring-[#0d9488] focus:border-[#0d9488]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your.email@example.com"
          className="bg-[#0a2e29] border-[#0d9488] text-white placeholder:text-gray-400 focus:ring-[#0d9488] focus:border-[#0d9488]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problemTitle" className="text-white">
          Issue Title
        </Label>
        <Input
          type="text"
          id="problemTitle"
          name="problemTitle"
          value={formData.problemTitle}
          onChange={handleChange}
          required
          placeholder="Brief description of your issue"
          className="bg-[#0a2e29] border-[#0d9488] text-white placeholder:text-gray-400 focus:ring-[#0d9488] focus:border-[#0d9488]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem" className="text-white">
          Details
        </Label>
        <Textarea
          id="problem"
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          required
          placeholder="Please describe your issue in detail"
          rows={4}
          className="resize-none bg-[#0a2e29] border-[#0d9488] text-white placeholder:text-gray-400 focus:ring-[#0d9488] focus:border-[#0d9488]"
        />
      </div>

      <Button
        type="submit"
        disabled={status.loading}
        className="w-full bg-[#0d9488] hover:bg-[#0b7a70] text-white"
      >
        {status.loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>

      {status.message && (
        <p
          className={`mt-2 text-center ${
            status.error ? "text-red-500" : "text-green-400"
          } font-medium`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
