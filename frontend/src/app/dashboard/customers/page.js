"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Award,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  User,
  Coffee,
} from "lucide-react";
import CoffeeLoader from "@/components/ui/CoffeeLoader";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (debouncedSearchQuery) {
        queryParams.append('search', debouncedSearchQuery);
      }

      const response = await fetch(`${API_URL}/dashboard/customers?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.pagination) {
          setCustomers(result.data);
          setTotalPages(result.pagination.totalPages || 1);
          setTotalCustomersCount(result.pagination.total || 0);
        } else {
          setCustomers(result);
          setTotalPages(1);
          setTotalCustomersCount(result.length || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, debouncedSearchQuery]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }),
    []
  );

  const formatCurrency = (value = 0) => currencyFormatter.format(value || 0);

  // Calculate aggregates based on fetched list for preview or display static
  const vipCount = useMemo(() => {
    return customers.filter(c => c.totalSpent > 2000 || c.totalOrders > 5).length;
  }, [customers]);

  const totalRevenueSum = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.totalSpent, 0);
  }, [customers]);

  const quickStats = [
    {
      id: "total",
      label: "Total Customers",
      value: totalCustomersCount,
      hint: "Registered directory entries",
      icon: Users,
      iconClasses: "bg-white/80 text-[#1A4D2E]",
    },
    {
      id: "vip",
      label: "VIP Customers",
      value: vipCount,
      hint: "Spent > ₹2,000 or 5+ orders on page",
      icon: Award,
      iconClasses: "bg-[#FDF2E9] text-[#D47C2F]",
    },
    {
      id: "revenue",
      label: "Page Total Spend",
      value: formatCurrency(totalRevenueSum),
      hint: "Sum of current page directory",
      icon: DollarSign,
      iconClasses: "bg-[#E8F5E9] text-[#1A4D2E]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[42px] text-white p-8 shadow-[0_45px_120px_rgba(10,46,29,0.45)] border border-white/10"
        style={{
          backgroundImage: `linear-gradient(135deg, #163d28ff 0%, #1A4D2E 60%, #2F7A46 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <span className="absolute -left-16 top-1/4 h-48 w-48 rounded-full bg-white/15 blur-[120px]" />
          <span className="absolute right-8 top-6 h-32 w-32 rounded-full bg-[#8DE0B0]/30 blur-[90px]" />
          <span className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-[#F4B860]/25 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold">
              <Sparkles className="h-4 w-4" /> CRM & Loyalty Directory
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Customer Relationship Management</h1>
              <p className="text-white/80 mt-2 text-lg">
                Identify VIP spenders, monitor loyalty trends, and export contact lists with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="rounded-[30px] bg-white/90 backdrop-blur border border-white shadow-[0_25px_60px_rgba(26,77,46,0.08)] p-5 transition duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#5F6F65]/70">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-[#1A4D2E] mt-2">{stat.value}</p>
                </div>
                <span className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.iconClasses}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="text-sm text-[#5F6F65] mt-3">{stat.hint}</p>
            </div>
          );
        })}
      </section>

      {/* Filters & Search */}
      <section className="rounded-[36px] bg-white/95 backdrop-blur border border-white shadow-[0_30px_70px_rgba(26,77,46,0.08)] p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-600/40 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or mobile number"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-coffee-600/20 focus:border-coffee-600 focus:outline-none transition-colors bg-white text-coffee-900"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-coffee-100 pt-4 text-sm text-[#5F6F65]">
          <p>
            Showing <span className="font-semibold text-[#1A4D2E]">{customers.length}</span> of{" "}
            <span className="font-semibold text-[#1A4D2E]">{totalCustomersCount}</span> customers
          </p>
        </div>
      </section>

      {/* Customers Table */}
      <section className="rounded-[40px] bg-white/95 backdrop-blur border border-white shadow-[0_35px_80px_rgba(26,77,46,0.08)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <CoffeeLoader size="lg" text="Brewing customers data..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Users className="h-10 w-10 text-coffee-200 mx-auto" />
            <p className="text-coffee-600/70 text-lg">No customers match this search</p>
            <p className="text-sm text-coffee-500">Try keywords like name, email, or phone number.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs uppercase tracking-[0.35em] text-[#5F6F65]/70 bg-[#F7F4EA]">
                  <tr>
                    {[
                      "Customer Name",
                      "Email Address",
                      "Mobile Number",
                      "Total Orders",
                      "Total Spend",
                      "Segment",
                    ].map((head) => (
                      <th key={head} className="px-6 py-4 text-left font-semibold">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/20">
                  {customers.map((cust, idx) => {
                    const isVIP = cust.totalSpent > 2000 || cust.totalOrders > 5;
                    return (
                      <tr
                        key={idx}
                        className="transition hover:bg-[#F8F5ED]"
                      >
                        <td className="px-6 py-4 font-semibold text-[#1A4D2E]">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#1A4D2E]/10 flex items-center justify-center text-[#1A4D2E]">
                              <User className="h-4 w-4" />
                            </div>
                            {cust.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#1A4D2E]/80">
                          <span className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 opacity-60" />
                            {cust.email}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#1A4D2E]/80">
                          <span className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 opacity-60" />
                            {cust.mobile}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#1A4D2E]/80 font-semibold">
                          <span className="flex items-center gap-2">
                            <ShoppingBag className="h-3.5 w-3.5 opacity-60" />
                            {cust.totalOrders} orders
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#1A4D2E]">
                          {formatCurrency(cust.totalSpent)}
                        </td>
                        <td className="px-6 py-4">
                          {isVIP ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Award className="h-3 w-3" /> VIP Spender
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-650 border border-gray-200">
                              Regular
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-coffee-100 bg-white px-6 py-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-750 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#5F6F65]">
                      Showing Page <span className="font-semibold text-[#1A4D2E]">{currentPage}</span> of{" "}
                      <span className="font-semibold text-[#1A4D2E]">{totalPages}</span> (Total {totalCustomersCount} customers)
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-[#1A4D2E] ring-1 ring-inset ring-coffee-100 hover:bg-[#F8F5ED] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === currentPage
                                  ? "z-10 bg-[#1A4D2E] text-white focus:z-20"
                                  : "text-[#1A4D2E] ring-1 ring-inset ring-coffee-100 hover:bg-[#F8F5ED] focus:z-20"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-750 ring-1 ring-inset ring-coffee-100"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-[#1A4D2E] ring-1 ring-inset ring-coffee-100 hover:bg-[#F8F5ED] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
