import { Search } from "lucide-react";
import { useState } from "react";

const UNIVERSITIES = [
  { id: "1", name: "Chiang Mai University", city: "Chiang Mai", country: "Thailand", students: 2, active: true, initial: "C", color: "#6366f1" },
  { id: "2", name: "Chulalongkorn University", city: "Bangkok", country: "Thailand", students: 4, active: true, initial: "C", color: "#0ea5e9" },
  { id: "3", name: "Mahidol University", city: "Nakhon Pathom", country: "Thailand", students: 3, active: false, initial: "M", color: "#f59e0b" },
  { id: "4", name: "Thammasat University", city: "Bangkok", country: "Thailand", students: 0, active: true, initial: "T", color: "#10b981" },
  { id: "5", name: "KMUTT", city: "Bangkok", country: "Thailand", students: 1, active: true, initial: "K", color: "#ec4899" },
  { id: "6", name: "Kasetsart University", city: "Bangkok", country: "Thailand", students: 2, active: true, initial: "K", color: "#8b5cf6" },
];

const CHIPS = ["All", "Active", "Inactive"];

export function CardGrid() {
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");

  const filtered = UNIVERSITIES.filter((u) => {
    if (active === "Active" && !u.active) return false;
    if (active === "Inactive" && u.active) return false;
    if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Universities</h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-gray-400"
            placeholder="Search universities…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Chips */}
        <div className="flex gap-2 mt-3">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActive(chip)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                active === chip
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-gray-400 font-medium">{filtered.length} universities</p>
      </div>

      {/* Carousel */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-8 snap-x snap-mandatory scrollbar-none">
        {filtered.map((u) => (
          <button
            key={u.id}
            className="snap-start shrink-0 w-64 h-80 relative overflow-hidden rounded-tl-3xl"
            style={{ backgroundColor: u.color }}
          >
            {/* Initials fill the card */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 font-black select-none"
                style={{ fontSize: "10rem", lineHeight: 1 }}>
                {u.initial}
              </span>
            </div>

            {/* Status dot */}
            <div className="absolute top-4 right-4">
              <div className={`size-2.5 rounded-full border-2 border-white/60 ${u.active ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-8 pb-4">
              <p className="text-white font-bold text-base leading-tight">{u.name}</p>
              <p className="text-white/70 text-xs mt-1">{u.city} · {u.students} students</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
