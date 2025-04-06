"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, UserCog, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { UserRole } from "@/types/user.types";
import { getRoleLabel } from "@/utils/basic";

interface RoleSwitcherProps {
  currentRole: UserRole;
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(currentRole);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    navigate(`/dashboard/${newRole}`);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "teamMember":
        return <Users className="mr-2 h-4 w-4" />;
      case "teamLeader":
        return <UserCog className="mr-2 h-4 w-4" />;
      case "admin":
        return <Shield className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          {getRoleIcon(role)}
          {getRoleLabel(role)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleRoleChange("teamMember")}>
          <Users className="mr-2 h-4 w-4" />
          Team Member
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("teamLeader")}>
          <UserCog className="mr-2 h-4 w-4" />
          Team Leader
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
          <Shield className="mr-2 h-4 w-4" />
          Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
