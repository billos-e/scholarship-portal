import { ArrowUpRight, GraduationCap, MapPin, Search } from "lucide-react";
import { useState } from "react";

const FEATURED = {
  id: "2",
  name: "Chulalongkorn University",
  city: "Bangkok",
  country: "Thailand",
  students: 4,
  semesters: 9,
  active: true,
  initial: "C",
  tagline: "Thailand's oldest university",
  color: "#0369a1",
  lightColor: "#e0f2fe",
};

const REST = [
  { id: "1", name: "Chiang Mai University", city: "Chiang Mai", students: 2, active: true, initial: "C", color: "#6366f1" },
  { id: "3", name: "Mahidol University", city: "Nakhon Pathom", students: 3, active: false, initial: "M", color: "#f59e0b" },
  { id: "4", name: "Thammasat University", city: "Bangkok", students: 0, active: true, initial: "T", color: "#10b981" },
  { id: "5", name: "KMUTT", city: "Bangkok", students: 1, active: true, initial: "K", color: "#ec4899" },
  { id: "6", name: "Kasetsart University", city: "Bangkok", students: 2, active: true, initial: "K", color: "#8b5cf6" },
];

const CHIPS = ["All", "Active", "Inactive"];

export function FeaturedScroll() {
  const [filter, setFilter] = useState("All");

  const filteredRest = REST.filter((u) => {
    if (filter === "Active") return u.active;
    if (filter === "Inactive") return !u.active;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans pb-10">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between bg-[#f5f4f0]">
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Admin Portal</p>
          <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
        </div>
        <button className="size-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <Search className="size-4 text-gray-500" />
        </button>
      </div>

      {/* Featured card */}
      <div className="mx-4 mb-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Featured</p>
        <div
          className="rounded-3xl overflow-hidden shadow-md"
          style={{ backgroundColor: FEATURED.color }}
        >
          {/* Top section */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div
                className="size-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {FEATURED.initial}
              </div>
              <button className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowUpRight className="size-4 text-white" />
              </button>
            </div>
            <h2 className="text-white text-lg font-bold mt-3 leading-tight">{FEATURED.name}</h2>
            <p className="text-white/70 text-sm mt-0.5">{FEATURED.tagline}</p>
          </div>

          {/* Stats bar */}
          <div className="bg-white/15 px-5 py-3 flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-white/90 text-sm">
              <GraduationCap className="size-4" />
              <span className="font-semibold">{FEATURED.students}</span>
              <span className="text-white/60 text-xs">students</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90 text-sm">
              <MapPin className="size-4" />
              <span className="text-white/80 text-xs">{FEATURED.city}</span>
            </div>
            <div className="ml-auto">
              <span className="text-[11px] font-semibold bg-white/20 text-white rounded-full px-3 py-1">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 flex gap-2 mb-3">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
              filter === chip
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* All universities — vertical list */}
      <div className="px-4 space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">All universities</p>
        {filteredRest.map((u) => (
          <button
            key={u.id}
            className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm text-left active:scale-[0.98] transition-transform"
          >
            <div
              className="size-11 rounded-xl shrink-0 flex items-center justify-center text-white text-base font-bold"
              style={{ backgroundColor: u.color }}
            >
              {u.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{u.city} · {u.students} students</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className={`size-2 rounded-full ${u.active ? "bg-emerald-400" : "bg-gray-300"}`} />
              <ArrowUpRight className="size-3.5 text-gray-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
