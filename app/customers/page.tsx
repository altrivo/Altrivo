"use client";

import { useState } from "react";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { Card, Button, Badge } from "@/components/shared";
import {
  Search,
  Filter,
  MessageCircle,
  Plus,
} from "@/components/shared/LucideIcons";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "VIP" | "Repeat" | "New";
  avatar: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c-1",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "+1 (555) 234-5678",
    location: "Austin, TX",
    ordersCount: 5,
    totalSpent: 1240.0,
    lastOrderDate: "Aug 11, 2026",
    status: "VIP",
    avatar: "SM",
  },
  {
    id: "c-2",
    name: "Liam Johnson",
    email: "liam.j@example.com",
    phone: "+1 (555) 987-6543",
    location: "Seattle, WA",
    ordersCount: 3,
    totalSpent: 620.0,
    lastOrderDate: "Aug 10, 2026",
    status: "Repeat",
    avatar: "LJ",
  },
  {
    id: "c-3",
    name: "Emma Davis",
    email: "emma.davis@example.com",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    ordersCount: 1,
    totalSpent: 290.0,
    lastOrderDate: "Aug 09, 2026",
    status: "New",
    avatar: "ED",
  },
  {
    id: "c-4",
    name: "Noah Wilson",
    email: "noah.w@example.com",
    phone: "+1 (555) 321-6549",
    location: "Miami, FL",
    ordersCount: 4,
    totalSpent: 890.0,
    lastOrderDate: "Aug 05, 2026",
    status: "VIP",
    avatar: "NW",
  },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = MOCK_CUSTOMERS.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <VendorLayout>
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
                Customer Directory
              </h1>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-900 border border-primary-200">
                {filteredCustomers.length} Verified Buyers
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-body">
              View customer order history, total lifetime value, location, and contact options.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" className="font-extrabold shadow-md gap-2">
              <Plus size={16} />
              <span>Add Customer Note</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="rounded-2xl border border-default bg-card p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search size={16} className="text-body" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, email, or city..."
              className="w-full rounded-xl border border-default bg-input py-2.5 pl-10 pr-4 text-sm font-semibold text-heading placeholder:text-body/70 focus:border-focus focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-body shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-default bg-input px-3.5 py-2 text-xs font-semibold text-heading focus:outline-none shadow-xs"
            >
              <option value="all">All Customer Types</option>
              <option value="vip">VIP Buyers</option>
              <option value="repeat">Repeat Buyers</option>
              <option value="new">New Buyers</option>
            </select>
          </div>
        </div>

        {/* Customers Table / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-6 space-y-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 text-primary-900 font-extrabold text-base flex items-center justify-center border border-primary-200 shadow-xs">
                    {customer.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-heading">{customer.name}</h3>
                    <p className="text-xs font-semibold text-body">{customer.email}</p>
                    <p className="text-[11px] font-mono text-body">{customer.phone}</p>
                  </div>
                </div>

                <Badge
                  variant={customer.status === "VIP" ? "accent" : customer.status === "Repeat" ? "primary" : "info"}
                  size="sm"
                  className="font-extrabold"
                >
                  {customer.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-default text-center text-xs">
                <div className="rounded-xl bg-neutral-50 p-2.5 border border-default">
                  <p className="text-[10px] font-extrabold text-body uppercase">Orders</p>
                  <p className="text-sm font-extrabold text-heading font-mono">{customer.ordersCount}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-2.5 border border-default">
                  <p className="text-[10px] font-extrabold text-body uppercase">Total Spent</p>
                  <p className="text-sm font-extrabold text-heading font-mono">${customer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-2.5 border border-default">
                  <p className="text-[10px] font-extrabold text-body uppercase">Location</p>
                  <p className="text-xs font-bold text-heading truncate">{customer.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-semibold text-body">
                  Last active: <strong className="text-heading font-bold">{customer.lastOrderDate}</strong>
                </span>

                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(
                        customer.name
                      )},%20thank%20you%20for%20your%20purchase%20at%20Tahleel%20Studio!`,
                      "_blank"
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-extrabold text-success-700 hover:bg-success-100 transition-colors shadow-xs"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </VendorLayout>
  );
}
