"use client";

import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { GetStarted } from "../custom/button/buttons";
import { Button } from "../ui/button";
import { useState } from "react";
import { WaitingListModal } from "../waiting-list-modal";

function Payment() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const openModal = (plan: string) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 bg-[#F3F4F6]" id="pricing">
      <div className="container mx-auto">
        <h2 className="text-center text-3xl font-bold text-[#111827] mb-4">
          Affordable Plans To Scale Your{" "}
          <span className="text-[#4F46E5]">Business</span>
        </h2>
        <p className="text-center text-[#6B7280] max-w-2xl mx-auto mb-12">
          Choose the perfect plan that fits your team&apos;s needs and budget.
          All plans include our core features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                  <path d="M9 22h9a2 2 0 0 0 2-2v-7" />
                  <path d="M13 14h7" />
                  <path d="M13 10h7" />
                  <path d="M9 6h1" />
                  <path d="M9 10h1" />
                  <path d="M9 14h1" />
                  <path d="M17 18h3v3" />
                  <path d="m14 15 6 6" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-[#111827]">FREE</CardTitle>
              <CardDescription className="text-[#6B7280]">
                Perfect for individuals and small teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 mb-8">
                <span className="text-4xl font-bold text-[#111827]">$0</span>
                <span className="text-[#6B7280]">/month</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Up to 5 projects",
                  "Basic task management",
                  // "Calendar integration",
                  "Email support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-[#4F46E5]" />
                    <span className="text-[#111827]">{feature}</span>
                  </li>
                ))}
              </ul>
              <GetStarted />
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-none shadow-lg relative">
            <div className="absolute top-0 right-0 bg-[#4F46E5] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2H2v10h10V2Z" />
                  <path d="M22 12h-8v10h8V12Z" />
                  <path d="M12 12H2v10h10V12Z" />
                  <path d="M22 2h-8v8h8V2Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-[#111827]">PRO</CardTitle>
              <CardDescription className="text-[#6B7280]">
                Ideal for growing teams and businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 mb-8">
                <span className="text-4xl font-bold text-[#111827]">$19</span>
                <span className="text-[#6B7280]">/month</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Unlimited projects",
                  "Advanced task management",
                  "AI workflow suggestions",
                  "Meeting management",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-[#4F46E5]" />
                    <span className="text-[#111827]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => openModal("Pro")}
                className="mt-8 w-full bg-[#4F46E5] hover:bg-[#4338CA]"
              >
                Join Waiting List
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M17 18h1" />
                  <path d="M12 18h1" />
                  <path d="M7 18h1" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-[#111827]">
                ENTERPRISE
              </CardTitle>
              <CardDescription className="text-[#6B7280]">
                For large organizations with complex needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 mb-8">
                <span className="text-4xl font-bold text-[#111827]">$39</span>
                <span className="text-[#6B7280]">/month</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Everything in Pro",
                  "Custom integrations",
                  "Advanced analytics",
                  "Dedicated account manager",
                  "SLA guarantees",
                  "24/7 phone support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-[#4F46E5]" />
                    <span className="text-[#111827]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => openModal("Enterprise")}
                className="mt-8 w-full bg-[#4F46E5] hover:bg-[#4338CA]"
              >
                Join Waiting List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <WaitingListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan}
      />
    </section>
  );
}

export default Payment;
