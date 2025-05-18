"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const handleLoginClick = () => {
  window.location.href = "app.youlead.com/login";
};

const handleSignUpClick = () => {
  window.location.href = "app.youlead.com/signup";
};

export const GetStartedForFree = () => {
  return (
    <Button
      onClick={handleLoginClick}
      className="bg-white text-[#4F46E5] hover:bg-gray-100 h-12 px-8 rounded-full"
    >
      Get Started For Free
    </Button>
  );
};

export const GetStarted = () => {
  return (
    <Button
      onClick={handleLoginClick}
      className="mt-8 w-full bg-[#4F46E5] hover:bg-[#4338CA]"
    >
      Get Started
    </Button>
  );
};

export const Login = () => {
  return (
    <Button
      onClick={handleLoginClick}
      variant="outline"
      className="hidden md:flex"
    >
      Log in
    </Button>
  );
};

export const SignUp = () => {
  return (
    <Button
      onClick={handleSignUpClick}
      className="bg-[#4F46E5] hover:bg-[#4338CA]"
    >
      Sign up
    </Button>
  );
};

export const GetStartedWithArrow = () => {
  return (
    <Button
      onClick={handleSignUpClick}
      className="bg-[#4F46E5] hover:bg-[#4338CA] h-12 px-8 rounded-full"
    >
      Get Started
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const JoinWaitingList = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      className="mt-8 w-full bg-[#4F46E5] hover:bg-[#4338CA]"
      onClick={onClick}
    >
      Join Waiting List
    </Button>
  );
};
