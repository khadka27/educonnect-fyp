"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
// import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "src/components/ui/popover"
import { cn } from "@/lib/utils"

interface PaymentsFiltersProps {
  defaultStatus?: string
}

export function PaymentsFilters({ defaultStatus }: PaymentsFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [status, setStatus] = useState(searchParams.get("status") || defaultStatus || "")
  const [method, setMethod] = useState(searchParams.get("method") || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined,
  )

  // Update filters when defaultStatus changes
  useEffect(() => {
    if (defaultStatus && defaultStatus !== status) {
      setStatus(defaultStatus)
      updateFilters({ status: defaultStatus })
    }
  }, [defaultStatus])

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateFilters({ status: value })
  }

  const handleMethodChange = (value: string) => {
    setMethod(value)
    updateFilters({ method: value })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    updateFilters({
      startDate: date ? format(date, "yyyy-MM-dd") : "",
    })
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    updateFilters({
      endDate: date ? format(date, "yyyy-MM-dd") : "",
    })
  }

  const clearFilters = () => {
    setStatus(defaultStatus || "")
    setMethod("")
    setStartDate(undefined)
    setEndDate(undefined)

    const params = new URLSearchParams()
    if (defaultStatus) {
      params.set("status", defaultStatus)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update params with new values
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`${pathname}?${params.toString()}`)
  }

  const hasActiveFilters = (status && (!defaultStatus || status !== defaultStatus)) || method || startDate || endDate

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={method} onValueChange={handleMethodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
            <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="NETBANKING">Net Banking</SelectItem>
            <SelectItem value="WALLET">Wallet</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[150px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            {/* <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus /> */}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[150px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            {/* <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus /> */}
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  )
}

