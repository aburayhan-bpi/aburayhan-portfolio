"use client";

import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { Button } from "@/components/ui/button";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "../../utils/icons";

export function LogoutButton({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // handle logout
  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
    router.refresh();
    toast.success("Admin session terminated successfully.");
  };

  return (
    <div>
      <Button
        onClick={() => setShowLogoutConfirm(true)}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 hover:cursor-pointer hover:bg-destructive/10 hover:text-destructive border-border"
      >
        {isCollapsed ? (
          <Icons.LogOut className="w-4 h-4" />
        ) : (
          <>
            <Icons.LogOut className="w-4 h-4" />
            <span>Logout</span>
          </>
        )}
      </Button>

      {/* Accessible Radix UI Confirmation Modal */}
      <AppConfirmDialog
        isOpen={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Sign Out of Admin Console?"
        description="Are you sure you want to end your current admin session? You will be redirected to the secure login gateway."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </div>
  );
}
