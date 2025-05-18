"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface WaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export function WaitingListModal({
  isOpen,
  onClose,
  planName,
}: WaitingListModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#111827]">
            Join the {planName} Waiting List
          </DialogTitle>
          <DialogDescription className="text-[#6B7280] mt-2">
            We're finalizing our pricing based on customer needs. Join our
            waiting list to be the first to know when {planName} is available.
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#111827]"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Join Waiting List"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-[#111827]">
              Thank you for joining!
            </h3>
            <p className="mt-2 text-[#6B7280]">
              We'll notify you when the {planName} plan becomes available.
            </p>
            <Button
              onClick={onClose}
              className="mt-6 bg-[#4F46E5] hover:bg-[#4338CA]"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
