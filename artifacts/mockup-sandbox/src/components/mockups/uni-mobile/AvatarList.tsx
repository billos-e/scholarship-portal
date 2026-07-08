import { ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";

const UNIVERSITIES = [
  { id: "1", name: "Chiang Mai University", city: "Chiang Mai", country: "Thailand", students: 2, semesters: 3, active: true, initial: "C", bg: "bg-indigo-100", text: "text-indigo-600" },
  { id: "2", name: "Chulalongkorn University", city: "Bangkok", country: "Thailand", students: 4, semesters: 9, active: true, initial: "C", bg: "bg-sky-100", text: "text-sky-600" },
  { id: "3", name: "Mahidol University", city: "Nakhon Pathom", country: "Thailand", students: 3, semesters: 6, active: false, initial: "M", bg: "bg-amber-100", text: "text-amber-600" },
  { id: "4", name: "Thammasat University", city: "Bangkok", country: "Thailand", students: 0, semesters: 0, active: true, initial: "T", bg: "bg-emerald-100", text: "text-emerald-600" },
  { id: "5", name: "KMUTT", city: "Bangkok", country: "Thailand", students: 1, semesters: 2, active: true, initial: "K", bg: "bg-pink-100", text: "text-pink-600" },
  { id: "6", name: "Kasetsart University", city: "Bangkok", country: "Thailand", students: 2, semesters: 4, active: true, initial: "K", bg: "bg-violet-100", text: "text-violet-600" },
];

const CHIPS = ["All", "Active", "Inactive"];

export function AvatarList() {
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");

  const filtered = UNIVERSITIES.filter((u) => {
    if (active === "Active" && !u.active) return false;
    if (active === "Inactive" && u.active) return false;
    if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Universities</h1>
          <button className="size-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
            <Plus className="size-4" />
          </button>
        </div>

        {/* Chips */}
        <div className="flex gap-1.5 mt-4 border-b border-gray-100">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActive(chip)}
              className={`pb-3 px-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                active === chip
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search className="size-3.5 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-gray-400"
            placeholder="Search by name or location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        {filtered.map((u) => (
          <button
            key={u.id}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className={`size-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-base ${u.bg} ${u.text}`}>
              {u.initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{u.city}, {u.country}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] text-gray-400">{u.students} students</span>
                <span className="text-[11px] text-gray-400">{u.semesters} semesters</span>
              </div>
            </div>

            {/* Status + chevron */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className={`size-2 rounded-full ${u.active ? "bg-emerald-400" : "bg-gray-300"}`} />
              <ChevronRight className="size-3.5 text-gray-300" />
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 pb-8">{filtered.length} of {UNIVERSITIES.length} universities</p>
    </div>
  );
}
