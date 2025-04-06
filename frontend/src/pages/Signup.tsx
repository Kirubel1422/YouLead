import { useSignUpMutation } from "@/api/auth.api";
import { AuthInput } from "@/components/input";
import { Loadable } from "@/components/state";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SignUpSchema, SignUpSchemaType } from "@/schemas/auth.schema";
import { login } from "@/store/auth/authSlice";
import { DefaultUserRoleType } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import {
     ArrowLeftIcon,
     ArrowRightIcon,
     EyeIcon,
     EyeOffIcon,
     LockIcon,
     MailIcon,
     PhoneIcon,
     UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

export default function Signup() {
     const [currentStep, setCurrentStep] = useState<number>(1);
     const [showPassword, setShowPassword] = useState<boolean>(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

     const togglePasswordVisibility = () => {
          setShowPassword((prev) => !prev);
     };

     const toggleConfirmPasswordVisibility = () => {
          setShowConfirmPassword((prev) => !prev);
     };

     const {
          register,
          formState: { errors },
          handleSubmit,
          setValue,
          getValues,
          reset,
     } = useForm<SignUpSchemaType>({
          resolver: zodResolver(SignUpSchema),
          mode: "onBlur",
          reValidateMode: "onBlur",
     });

     const [signin, { isLoading }] = useSignUpMutation();
     const { showToast } = useToast();
     const navigate = useNavigate();
     const dispatch = useDispatch();

     // Handle signup logic here
     const onSubmit = async (data: SignUpSchemaType) => {
          try {
               const response = await signin(data).unwrap();
               showToast(response.message, "success");
               dispatch(login(response.data));
               reset();
               navigate("/dashboard");
          } catch (error: any) {
               showToast(error.data.message, "error");
          }
     };

     const handleGoogleSignUp = () => {
          // Handle Google sign-up logic here
          console.log("Google sign-up clicked");
     };

     const validateStep1 = () => {
          const isValid =
               !errors.email?.message &&
               !errors.password?.message &&
               !errors.confirmPassword?.message &&
               !errors.firstName?.message &&
               !errors.lastName?.message;

          if (!isValid) {
               showToast("Please fill in all required fields correctly", "error");
          }

          return isValid;
     };

     const handleNext = async () => {
          if (validateStep1()) {
               setCurrentStep(2);
          }
     };

     const handleBack = () => {
          setCurrentStep(1);
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
               <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                         <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                         <CardDescription className="text-center">
                              {currentStep === 1
                                   ? "Enter your information to create an account"
                                   : "Select your role in the team"}
                         </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                         <CardContent className="space-y-4">
                              {currentStep === 1 ? (
                                   // Step 1: Personal Information
                                   <>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="space-y-2">
                                                  <Label htmlFor="firstName" className="text-sm font-medium">
                                                       First Name *
                                                  </Label>
                                                  <AuthInput
                                                       preIcon={
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                                 <UserIcon className="h-5 w-5" />
                                                            </div>
                                                       }
                                                       id="firstName"
                                                       {...register("firstName")}
                                                       placeholder="John"
                                                       error={errors.firstName?.message}
                                                       disabled={isLoading}
                                                  />
                                             </div>

                                             <div className="space-y-2">
                                                  <Label htmlFor="lastName" className="text-sm font-medium">
                                                       Last Name *
                                                  </Label>
                                                  <AuthInput
                                                       preIcon={
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                                 <UserIcon className="h-5 w-5" />
                                                            </div>
                                                       }
                                                       id="lastName"
                                                       {...register("lastName")}
                                                       placeholder="Doe"
                                                       error={errors.lastName?.message}
                                                       disabled={isLoading}
                                                  />
                                             </div>
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="email" className="text-sm font-medium">
                                                  Email*
                                             </Label>
                                             <AuthInput
                                                  preIcon={
                                                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                            <MailIcon className="h-5 w-5" />
                                                       </div>
                                                  }
                                                  id="email"
                                                  {...register("email")}
                                                  type="email"
                                                  placeholder="name@company.com"
                                                  disabled={isLoading}
                                                  error={errors.email?.message}
                                             />
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="phoneNumber" className="text-sm font-medium">
                                                  Phone Number
                                             </Label>
                                             <AuthInput
                                                  id="phoneNumber"
                                                  {...register("phoneNumber")}
                                                  type="tel"
                                                  placeholder="+1 (555) 000-0000"
                                                  className="pl-10"
                                                  preIcon={
                                                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                            <PhoneIcon className="h-5 w-5" />
                                                       </div>
                                                  }
                                                  error={errors.phoneNumber?.message}
                                                  disabled={isLoading}
                                             />
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="password" className="text-sm font-medium">
                                                  Password*
                                             </Label>

                                             <AuthInput
                                                  preIcon={
                                                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                            <LockIcon className="h-5 w-5" />
                                                       </div>
                                                  }
                                                  id="password"
                                                  {...register("password")}
                                                  type={showPassword ? "text" : "password"}
                                                  placeholder="••••••••"
                                                  suffixIcon={
                                                       <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                                            onClick={togglePasswordVisibility}
                                                       >
                                                            {showPassword ? (
                                                                 <EyeOffIcon className="h-5 w-5" />
                                                            ) : (
                                                                 <EyeIcon className="h-5 w-5" />
                                                            )}
                                                       </button>
                                                  }
                                                  error={errors.password?.message}
                                                  disabled={isLoading}
                                             />
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                                  Confirm Password*
                                             </Label>
                                             <div className="relative">
                                                  <AuthInput
                                                       error={errors.confirmPassword?.message}
                                                       id="confirmPassword"
                                                       preIcon={
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                                 <LockIcon className="h-5 w-5" />
                                                            </div>
                                                       }
                                                       type={showConfirmPassword ? "text" : "password"}
                                                       {...register("confirmPassword")}
                                                       placeholder="••••••••"
                                                       disabled={isLoading}
                                                       suffixIcon={
                                                            <button
                                                                 type="button"
                                                                 className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                                                 onClick={toggleConfirmPasswordVisibility}
                                                            >
                                                                 {showConfirmPassword ? (
                                                                      <EyeOffIcon className="h-5 w-5" />
                                                                 ) : (
                                                                      <EyeIcon className="h-5 w-5" />
                                                                 )}
                                                            </button>
                                                       }
                                                  />
                                             </div>
                                        </div>
                                   </>
                              ) : (
                                   // Step 2: Role Selection
                                   <div className="space-y-4">
                                        <Label>Select your role</Label>
                                        <RadioGroup
                                             value={getValues("role")}
                                             onValueChange={(value: DefaultUserRoleType) => {
                                                  setValue("role", value, { shouldValidate: true });
                                             }}
                                             className={cn(
                                                  "space-y-3",
                                                  errors.role?.message && "border-red-500 p-3 rounded-md border",
                                             )}
                                        >
                                             <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                                                  <RadioGroupItem value="teamLeader" id="teamLeader" />
                                                  <Label htmlFor="teamLeader" className="flex-1 cursor-pointer">
                                                       <div className="font-medium">Team Leader</div>
                                                       <div className="text-sm text-gray-500">
                                                            Create and manage team, assign tasks, and track progress
                                                       </div>
                                                  </Label>
                                             </div>
                                             <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                                                  <RadioGroupItem value="teamMember" id="teamMember" />
                                                  <Label htmlFor="teamMember" className="flex-1 cursor-pointer">
                                                       <div className="font-medium">Team Member</div>
                                                       <div className="text-sm text-gray-500">
                                                            Join team, collaborate on tasks, and communicate with team
                                                            members
                                                       </div>
                                                  </Label>
                                             </div>
                                        </RadioGroup>
                                        {errors.role?.message && (
                                             <p className="text-sm text-red-500">{errors.role?.message}</p>
                                        )}
                                   </div>
                              )}
                         </CardContent>
                         <CardFooter className="flex flex-col space-y-4 mt-8">
                              {currentStep === 1 ? (
                                   <Button type="button" className="w-full" onClick={handleNext} disabled={isLoading}>
                                        Next <ArrowRightIcon className="ml-2 h-4 w-4" />
                                   </Button>
                              ) : (
                                   <div className="flex w-full space-x-2">
                                        <Button
                                             type="button"
                                             variant="outline"
                                             onClick={handleBack}
                                             disabled={isLoading}
                                             className="flex-1"
                                        >
                                             <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        <Button type="submit" className="flex-1" disabled={isLoading}>
                                             <Loadable isLoading={isLoading}>Create account</Loadable>
                                        </Button>
                                   </div>
                              )}

                              {currentStep === 1 && (
                                   <>
                                        <div className="relative">
                                             <div className="absolute inset-0 flex items-center">
                                                  <Separator />
                                             </div>
                                             <div className="relative flex justify-center text-xs uppercase">
                                                  <span className="bg-background px-2 text-muted-foreground">
                                                       Or continue with
                                                  </span>
                                             </div>
                                        </div>

                                        <Button
                                             type="button"
                                             variant="outline"
                                             className="w-full"
                                             onClick={handleGoogleSignUp}
                                             disabled={isLoading}
                                        >
                                             <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  viewBox="0 0 24 24"
                                                  className="h-5 w-5 mr-2"
                                             >
                                                  <path
                                                       fill="#4285F4"
                                                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                  />
                                                  <path
                                                       fill="#34A853"
                                                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                  />
                                                  <path
                                                       fill="#FBBC05"
                                                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                  />
                                                  <path
                                                       fill="#EA4335"
                                                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                  />
                                                  <path fill="none" d="M1 1h22v22H1z" />
                                             </svg>
                                             Continue with Google
                                        </Button>
                                   </>
                              )}

                              <p className="text-center text-sm text-gray-600">
                                   Already have an account?{" "}
                                   <a href="#" className="text-primary font-medium hover:underline">
                                        Sign in
                                   </a>
                              </p>
                         </CardFooter>
                    </form>
               </Card>
          </div>
     );
}
