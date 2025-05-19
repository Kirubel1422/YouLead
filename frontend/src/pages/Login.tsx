import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { AuthInput } from "@/components/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginSchemaType } from "@/schemas/auth.schema";
import { useLoginMutation } from "@/api/auth.api";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/Toast";
import { Loadable } from "@/components/state";
import { useDispatch } from "react-redux";
import { login } from "@/store/auth/authSlice";
import { Link, useNavigate } from "react-router";

export default function Login() {
     const [showPassword, setShowPassword] = useState<boolean>(false);
     const togglePasswordVisibility = () => {
          setShowPassword((prev) => !prev);
     };

     // Redux Toolkit Query for login
     const [signin, { isLoading }] = useLoginMutation();

     const {
          register,
          handleSubmit,
          formState: { errors },
          reset,
     } = useForm<LoginSchemaType>({
          resolver: zodResolver(LoginSchema),
     });

     const { showToast } = useToast();
     const dispatch = useDispatch();
     const navigate = useNavigate();

     const onSubmit = async (data: LoginSchemaType): Promise<void> => {
          // Handle login logic here
          try {
               const response = await signin(data).unwrap();
               showToast(response.message, "success");
               dispatch(login(response.data));
               reset();
               if (response.data.role === "teamLeader") {
                    navigate("/dashboard/leader");
               } else if (response.data.role === "teamMember") {
                    navigate("/dashboard");
               }
          } catch (error: any) {
               showToast(error?.data?.message || "Something went wrong. Please try again later.", "error");
          }
     };

     const handleGoogleSignIn = () => {
          // Handle Google sign-in logic here
          console.log("Google sign-in clicked");
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
               <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                         <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                         <CardDescription className="text-center">
                              Enter your credentials to access your account
                         </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                         <CardContent className="space-y-4">
                              <div className="space-y-2">
                                   <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                   </Label>
                                   <AuthInput
                                        preIcon={
                                             <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                  <MailIcon className="h-5 w-5" />
                                             </div>
                                        }
                                        id="email"
                                        type="email"
                                        error={errors.email?.message}
                                        placeholder="john@example.com"
                                        {...register("email")}
                                        disabled={isLoading}
                                   />
                              </div>

                              <div className="space-y-2">
                                   <div className="flex justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                             Password
                                        </Label>
                                        <a href="#" className="text-sm text-primary hover:underline">
                                             Forgot password?
                                        </a>
                                   </div>

                                   <AuthInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        error={errors.password?.message}
                                        disabled={isLoading}
                                        suffixIcon={
                                             <button
                                                  type="button"
                                                  onClick={togglePasswordVisibility}
                                                  className="absolute z-50 top-1/2 hover:cursor-pointer -translate-y-1/2 right-0 flex items-center pr-3 text-gray-400"
                                             >
                                                  {showPassword ? (
                                                       <EyeOffIcon className="h-5 w-5" />
                                                  ) : (
                                                       <EyeIcon className="h-5 w-5" />
                                                  )}
                                             </button>
                                        }
                                        preIcon={
                                             <div className="absolute top-1/2 z-50 -translate-y-1/2 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                                  <LockIcon className="h-5 w-5" />
                                             </div>
                                        }
                                   />
                              </div>
                         </CardContent>

                         <CardFooter className="flex flex-col space-y-4 mt-8">
                              <Button variant={"primary"} type="submit" className="w-full" disabled={isLoading}>
                                   <Loadable isLoading={isLoading}>Login</Loadable>
                              </Button>

                              {/* <div className="relative">
                                   <div className="absolute inset-0 flex items-center">
                                        <Separator />
                                   </div>
                                   <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                             Or continue with
                                        </span>
                                   </div>
                              </div> */}
                              {/* 
                              <Button
                                   type="button"
                                   variant="outline"
                                   className="w-full"
                                   onClick={handleGoogleSignIn}
                                   disabled={isLoading}
                              >
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
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
                              </Button> */}

                              <p className="text-center text-sm text-gray-600">
                                   Don't have an account?{" "}
                                   <Link to="/signup" className="text-[#4f46e5] font-medium hover:underline">
                                        Sign up
                                   </Link>
                              </p>
                         </CardFooter>
                    </form>
               </Card>
          </div>
     );
}
