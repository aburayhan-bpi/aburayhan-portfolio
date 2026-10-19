"use client";

import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { setUser, setTokens } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import { IAllStatusEnum, IRole } from "@/types/global";
import Cookies from "js-cookie";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTarget = searchParams.get("redirect") || "/dashboard/admin";

  // Check if session already exists, redirect immediately
  useEffect(() => {
    const token = Cookies.get("accessToken");
    const role = Cookies.get("userRole");
    if (token && token.trim().length > 0) {
      router.replace(role === "ADMIN" ? redirectTarget : "/");
    }
  }, [redirectTarget, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        dispatch(
          setUser({
            id: resData.user.id,
            email: resData.user.email,
            firstName: resData.user.firstName,
            lastName: resData.user.lastName,
            phone: resData.user.phone,
            location: resData.user.location,
            profilePictureUrl: resData.user.avatar,
            role: IRole.SUPER_ADMIN,
            status: IAllStatusEnum.ACTIVE,
            twoFactor: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        );

        dispatch(setTokens({ accessToken: resData.token }));
        Cookies.set("userRole", "ADMIN");

        toast.success("Welcome back!");
        router.replace(redirectTarget);
      } else {
        toast.error(resData.error || "Invalid credentials. Please verify your email and password.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12">
      {/* Left Column: Form Container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Navbar Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/logo.svg"
              alt="Abu Rayhan"
              width={130}
              height={32}
              priority
              loading="eager"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Portfolio
          </Link>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-[400px] mx-auto my-12 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your credentials to continue to your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-mono text-muted-foreground block"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`w-full h-10 pl-10 pr-3 text-xs rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive font-mono">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-mono text-muted-foreground block"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full h-10 pl-10 pr-10 text-xs rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive font-mono">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Notice */}
        <div className="text-center text-[11px] font-mono text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Md Abu Rayhan. All rights reserved.</span>
        </div>
      </div>

      {/* Right Column: Branded Side Panel */}
      <AuthSidePanel />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
