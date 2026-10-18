"use client";

import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { setUser, setTokens } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import { IAllStatusEnum, IRole } from "@/types/global";
import Cookies from "js-cookie";
import { Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const redirectTarget = searchParams.get("redirect") || "/dashboard/admin";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "aburayhan.bpi@gmail.com",
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

        toast.success("Welcome back, Rayhan! Admin session active.");
        router.replace(redirectTarget);
      } else {
        toast.error(resData.error || "Authentication failed. Check your password.");
      }
    } catch {
      toast.error("Network error during authorization.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setValue("email", "aburayhan.bpi@gmail.com");
    setValue("password", "Rayhan#Admin@2026!");
    toast.info("Master credentials populated for quick review");
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
        <div className="w-full max-w-[420px] mx-auto my-12 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-mono text-primary">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Restricted System Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Admin Authorization
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to manage projects, edit case studies, and view telemetry leads.
            </p>
          </div>

          {/* Quick Credential Helper Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/50 border border-border text-xs">
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-accent" />
              <span>Admin: aburayhan.bpi@gmail.com</span>
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 text-[10px] font-mono font-medium bg-card hover:bg-secondary text-primary border border-border rounded-lg transition-colors cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-mono text-muted-foreground block"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="aburayhan.bpi@gmail.com"
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-mono text-muted-foreground block"
              >
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full h-10 pl-10 pr-3 text-xs rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
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
                  <span>Verifying Session...</span>
                </>
              ) : (
                <span>Authenticate &amp; Enter Console</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Notice */}
        <div className="text-center text-[11px] font-mono text-muted-foreground">
          <span>Protected by AES-256 JWT Encryption • Md Abu Rayhan</span>
        </div>
      </div>

      {/* Right Column: Branded Side Panel */}
      <AuthSidePanel />
    </div>
  );
}
