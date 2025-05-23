"use client";

import type React from "react";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Search, SlidersHorizontal, X } from "lucide-react";

export function UsersTableFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "ALL");
  const [limit, setLimit] = useState(searchParams.get("limit") || "10");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    updateFilters({ role: value });
  };

  const handleLimitChange = (value: string) => {
    setLimit(value);
    updateFilters({ limit: value });
  };

  const clearFilters = () => {
    setSearch("");
    setRole("ALL");
    setLimit("10");
    router.push(pathname);
  };

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params with new values
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = search || role !== "ALL" || limit !== "10";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearch} className="flex items-center gap-2 sm:w-96">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex items-center gap-2">
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[120px] text-foreground">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-foreground">
              All roles
            </SelectItem>
            <SelectItem value="USER" className="text-foreground">
              User
            </SelectItem>
            <SelectItem value="TEACHER" className="text-foreground">
              Teacher
            </SelectItem>
            <SelectItem value="ADMIN" className="text-foreground">
              Admin
            </SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">More filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel className="text-foreground">
              Rows per page
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={limit === "10"}
              onCheckedChange={() => handleLimitChange("10")}
              className="text-foreground"
            >
              10 per page
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={limit === "20"}
              onCheckedChange={() => handleLimitChange("20")}
              className="text-foreground"
            >
              20 per page
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={limit === "50"}
              onCheckedChange={() => handleLimitChange("50")}
              className="text-foreground"
            >
              50 per page
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={limit === "100"}
              onCheckedChange={() => handleLimitChange("100")}
              className="text-foreground"
            >
              100 per page
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
