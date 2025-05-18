import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code,
  Lightbulb,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GetStarted,
  GetStartedForFree,
  GetStartedWithArrow,
  Login,
  SignUp,
} from "@/components/custom/button/buttons";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex mx-auto h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#4F46E5]">You Lead</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-[#111827] hover:text-[#4F46E5]"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-[#111827] hover:text-[#4F46E5]"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-[#111827] hover:text-[#4F46E5]"
            >
              FAQ
            </Link>
            <Link
              href="#roadmap"
              className="text-sm font-medium text-[#111827] hover:text-[#4F46E5]"
            >
              Road Map
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Login />

            <SignUp />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-[#F3F4F6] py-20 md:py-28">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111827] max-w-3xl">
              Boost Your Productivity With Our Smart SaaS Tools
            </h1>
            <p className="mt-6 text-lg text-[#6B7280] max-w-2xl">
              Streamline your workflow, manage projects efficiently, and
              leverage AI to optimize your team's performance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row ">
              <GetStartedWithArrow />
            </div>
            <div className="mt-16 relative w-full max-w-5xl">
              <div className="aspect-[16/9] overflow-hidden rounded-xl shadow-2xl">
                <Image
                  src="/placeholder.svg?height=1080&width=1920"
                  alt="YouLead Dashboard"
                  width={1920}
                  height={1080}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white" id="features">
          <div className="container">
            <h2 className="text-center text-3xl font-bold text-[#111827] mb-4">
              Services Included In Our{" "}
              <span className="text-[#4F46E5]">Every Plan</span>
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md">
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
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M9 14.25v-4.5L12 12l3-2.25v4.5" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-[#111827]">
                    AI Task Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B7280]">
                    Let our AI suggest optimal task sequences and workflows
                    based on your team's performance patterns.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
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
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-[#111827]">
                    Project Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B7280]">
                    Create and manage multiple projects with customizable
                    templates and automated task distribution.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
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
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M8 10v4" />
                      <path d="M12 10v4" />
                      <path d="M16 10v4" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-[#111827]">
                    Meeting Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B7280]">
                    Schedule, organize, and track meetings with integrated
                    calendar and automated minutes generation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section 1 */}
        <section className="py-20 md:px-6 bg-[#F3F4F6]">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#111827]">
                  Streamline Your Product Launch With Our{" "}
                  <span className="text-[#4F46E5]">Powerful</span> Features
                </h2>
                <p className="mt-4 text-[#6B7280]">
                  Our platform provides comprehensive tools to manage your
                  product development lifecycle from ideation to launch.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Intuitive task management",
                    "Real-time collaboration",
                    "Automated progress tracking",
                    "Customizable workflows",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="mr-3 h-6 w-6 flex-shrink-0 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                        <Check className="h-4 w-4 text-[#4F46E5]" />
                      </div>
                      <span className="text-[#111827]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 bg-[#4F46E5] hover:bg-[#4338CA]">
                  Learn More
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-xl">
                  <Image
                    src="/placeholder.svg?height=900&width=1200"
                    alt="Product Management Dashboard"
                    width={1200}
                    height={900}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section 2 */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-xl">
                  <Image
                    src="/placeholder.svg?height=900&width=1200"
                    alt="Comprehensive Calendar Dashboard"
                    width={1200}
                    height={900}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold text-[#111827]">
                  Comprehensive <span className="text-[#4F46E5]">Calendar</span>{" "}
                  & Team Performance Metrics
                </h2>
                <p className="mt-4 text-[#6B7280]">
                  Stay on top of deadlines and measure your team's productivity
                  with our integrated calendar and performance analytics.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "All-in-one calendar view for tasks and meetings",
                    "Team availability and workload visualization",
                    "Performance metrics and productivity trends",
                    "Automated deadline reminders and notifications",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="mr-3 h-6 w-6 flex-shrink-0 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                        <Check className="h-4 w-4 text-[#4F46E5]" />
                      </div>
                      <span className="text-[#111827]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-[#F3F4F6]" id="pricing">
          <div className="container mx-auto">
            <h2 className="text-center text-3xl font-bold text-[#111827] mb-4">
              Affordable Plans To Scale Your{" "}
              <span className="text-[#4F46E5]">Business</span>
            </h2>
            <p className="text-center text-[#6B7280] max-w-2xl mx-auto mb-12">
              Choose the perfect plan that fits your team's needs and budget.
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
                  <CardTitle className="text-2xl text-[#111827]">
                    FREE
                  </CardTitle>
                  <CardDescription className="text-[#6B7280]">
                    Perfect for individuals and small teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 mb-8">
                    <span className="text-4xl font-bold text-[#111827]">
                      $0
                    </span>
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
                    <span className="text-4xl font-bold text-[#111827]">
                      $19
                    </span>
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
                  <GetStarted />
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
                    <span className="text-4xl font-bold text-[#111827]">
                      $39
                    </span>
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
                  <Button className="mt-8 w-full bg-[#4F46E5] hover:bg-[#4338CA]">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white" id="faq">
          <div className="container">
            <h2 className="text-center text-3xl font-bold text-[#111827] mb-4">
              Common Questions <span className="text-[#4F46E5]">About</span> Our
              Platform
            </h2>
            <p className="text-center text-[#6B7280] max-w-2xl mx-auto mb-12">
              Find quick answers to frequently asked questions about our
              platform and services.
            </p>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="item-1"
                  className="border-b border-[#E5E7EB]"
                >
                  <AccordionTrigger className="text-[#111827] hover:text-[#4F46E5] py-4">
                    How does the AI task workflow feature work?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B7280] pb-4">
                    Our AI analyzes your team's work patterns, project
                    requirements, and deadlines to suggest optimal task
                    sequences and workflows. It learns from your team's
                    performance over time to provide increasingly accurate
                    recommendations.
                  </AccordionContent>
                </AccordionItem>

                {/* <AccordionItem
                  value="item-2"
                  className="border-b border-[#E5E7EB]"
                >
                  <AccordionTrigger className="text-[#111827] hover:text-[#4F46E5] py-4">
                    Can I integrate with other tools I'm already using?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B7280] pb-4">
                    Yes, our platform offers integrations with popular tools
                    like Slack, Microsoft Teams, Google Workspace, and many
                    more. Pro and Enterprise plans include additional custom
                    integration options.
                  </AccordionContent>
                </AccordionItem> */}

                <AccordionItem
                  value="item-3"
                  className="border-b border-[#E5E7EB]"
                >
                  <AccordionTrigger className="text-[#111827] hover:text-[#4F46E5] py-4">
                    How secure is my data on your platform?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B7280] pb-4">
                    We take security seriously. Your data is encrypted both in
                    transit and at rest. We use industry-standard security
                    practices, regular security audits, and comply with GDPR,
                    CCPA, and other privacy regulations.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="border-b border-[#E5E7EB]"
                >
                  <AccordionTrigger className="text-[#111827] hover:text-[#4F46E5] py-4">
                    Can I upgrade or downgrade my plan later?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B7280] pb-4">
                    You can upgrade or downgrade your plan at any time. When
                    upgrading, you'll get immediate access to new features. If
                    you downgrade, the changes will take effect at the end of
                    your current billing cycle.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-5"
                  className="border-b border-[#E5E7EB]"
                >
                  <AccordionTrigger className="text-[#111827] hover:text-[#4F46E5] py-4">
                    Do you offer a free trial for paid plans?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#6B7280] pb-4">
                    Yes, we offer a 14-day free trial for both our Pro and
                    Enterprise plans. No credit card is required to start your
                    trial, and you can downgrade to the Free plan at any time if
                    you decide not to continue.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#F3F4F6]" id="roadmap">
          <div className="container mx-auto">
            <h2 className="text-center text-3xl font-bold text-[#111827] mb-4">
              Our Product <span className="text-[#4F46E5]">Roadmap</span>
            </h2>
            <p className="text-center text-[#6B7280] max-w-2xl mx-auto mb-12">
              We're constantly improving You Lead. Here's what we're working on
              next.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Current Release */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-[#111827]">
                    Current Release
                  </CardTitle>
                  <CardDescription className="text-[#6B7280]">
                    Available now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "AI task workflow suggestions",
                      "Core project management",
                      "Task creation and assignment",
                      "Team collaboration tools",
                      "Email notifications",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-green-600" />
                        <span className="text-[#111827]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Coming Soon */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                    <Rocket className="h-6 w-6 text-[#4F46E5]" />
                  </div>
                  <CardTitle className="text-xl text-[#111827]">
                    Coming Soon
                  </CardTitle>
                  <CardDescription className="text-[#6B7280]">
                    Next quarter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Advanced analytics dashboard",
                      "Custom project templates",
                      "Time tracking integration",
                      "Mobile app for iOS and Android",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <ChevronRight className="mr-2 h-5 w-5 text-[#4F46E5]" />
                        <span className="text-[#111827]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Future Plans */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-[#4F46E5]" />
                  </div>
                  <CardTitle className="text-xl text-[#111827]">
                    Future Plans
                  </CardTitle>
                  <CardDescription className="text-[#6B7280]">
                    On our radar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Advanced AI-powered insights",
                      "Custom integrations platform",
                      "Resource allocation optimization",
                      "Advanced reporting tools",
                      "Enterprise-grade security features",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Code className="mr-2 h-5 w-5 text-[#6B7280]" />
                        <span className="text-[#111827]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#4F46E5]">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Unlock More With A Simple Setup
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of teams already using <em>You Lead</em> to boost
              their productivity and streamline their workflows.
            </p>
            <GetStartedForFree />
          </div>
        </section>
      </main>
      <footer className="bg-[#111827] text-white mt-10 w-screen py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">You Lead</h3>
              <p className="text-gray-400">
                Streamline your workflow and boost productivity with our smart
                project management tools.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                {[
                  { name: "Features", id: "features" },
                  { name: "Pricing", id: "pricing" },
                  { name: "FAQ", id: "faq" },
                  { name: "Roadmap", id: "roadmap" },
                ].map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`#${item.id}`}
                      className="text-gray-400 hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Documentation", "Guides", "API", "Community", "Support"].map(
                  (item) => (
                    <li key={item}>
                      <Link href="#" className="text-gray-400 hover:text-white">
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div> */}
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} You Lead. All rights reserved.
            </p>
            {/* <div className="flex space-x-6 mt-4 md:mt-0">
              {["Twitter", "LinkedIn", "GitHub", "YouTube"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-white"
                >
                  {social}
                </Link>
              ))}
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
