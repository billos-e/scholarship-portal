import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Upload,
  Heart,
  FileText,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  GraduationCap,
  Smile,
  MessageSquare,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Semester", icon: Calendar },
  { id: 2, label: "Tuition", icon: FileText },
  { id: 3, label: "Academic", icon: GraduationCap },
  { id: 4, label: "Wellbeing", icon: Heart },
  { id: 5, label: "Reflections", icon: MessageSquare },
];

const WELLBEING_ITEMS = [
  { key: "physical", label: "Physical wellbeing" },
  { key: "mental", label: "Mental wellbeing" },
  { key: "financial", label: "Financial wellbeing" },
  { key: "stress", label: "Stress level" },
  { key: "confidence", label: "Confidence in studies" },
];

const CHALLENGES = [
  "Financial",
  "Family",
  "Mental health",
  "Housing",
  "Transportation",
  "Technology",
  "Health",
  "Other",
];

const ACTIVITIES = [
  "Community service",
  "Volunteering",
  "Leadership",
  "Internship",
  "Part-time work",
  "Student clubs",
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2",
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-white border-slate-200 text-slate-400"
                )}
              >
                {done ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  active
                    ? "text-indigo-600"
                    : done
                      ? "text-emerald-600"
                      : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 mx-1 mb-5 transition-all duration-300",
                  current > step.id ? "bg-emerald-400" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileUploadField({
  label,
  hint,
  accept,
}: {
  label: string;
  hint: string;
  accept: string;
}) {
  const [file, setFile] = useState<string | null>(null);
  return (
    <div>
      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
        {label}
      </Label>
      <label
        className={cn(
          "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors",
          file
            ? "border-emerald-300 bg-emerald-50"
            : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
        )}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
        />
        {file ? (
          <>
            <Check className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium text-center max-w-[200px] truncate">
              {file}
            </span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-slate-400" />
            <span className="text-xs text-slate-500 text-center">{hint}</span>
          </>
        )}
      </label>
    </div>
  );
}

function RatingRow({ label }: { label: string }) {
  const [val, setVal] = useState(0);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setVal(n)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs font-semibold transition-all",
              val === n
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : val >= n
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckGrid({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (item: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  return (
    <div>
      <Label className="text-sm font-medium text-slate-700 mb-2 block">
        {title}
      </Label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => toggle(item)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              selected.has(item)
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step1() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Select Semester</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Choose the semester this submission covers.
        </p>
      </div>
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
          Semester
        </Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a semester…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fall-2026">Fall 2026</SelectItem>
            <SelectItem value="spring-2026">Spring 2026</SelectItem>
            <SelectItem value="fall-2025">Fall 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Tuition Payment</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Enter your tuition details and upload payment proof.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Amount due (THB) <span className="text-red-400">*</span>
          </Label>
          <Input type="number" placeholder="0.00" />
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Due date
          </Label>
          <Input type="date" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FileUploadField
          label="Invoice / bill"
          hint="PDF, JPG or PNG"
          accept=".pdf,.jpg,.png"
        />
        <FileUploadField
          label="Payment screenshot"
          hint="JPG or PNG"
          accept=".jpg,.png"
        />
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Academic Report</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Share your academic progress this semester.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            GPA (0–4)
          </Label>
          <Input type="number" min={0} max={4} step={0.01} placeholder="3.50" />
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Credits completed
          </Label>
          <Input type="number" min={0} placeholder="18" />
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
          Passed all courses?
        </Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FileUploadField
        label="Transcript"
        hint="PDF, JPG or PNG"
        accept=".pdf,.jpg,.png"
      />
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Wellbeing & Activities</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Rate your wellbeing and tell us how you've been engaged.
        </p>
      </div>
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">
          Rate each area (1 = low, 5 = high)
        </Label>
        <div className="bg-slate-50 rounded-xl px-4 py-1 border border-slate-100">
          {WELLBEING_ITEMS.map((item) => (
            <RatingRow key={item.key} label={item.label} />
          ))}
        </div>
      </div>
      <CheckGrid title="Current challenges" items={CHALLENGES} />
      <CheckGrid title="Activities & involvement" items={ACTIVITIES} />
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Reflections</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Share your thoughts and experiences this semester.
        </p>
      </div>
      {[
        {
          key: "achievement",
          label: "Biggest achievement",
          placeholder: "What are you most proud of this semester?",
        },
        {
          key: "challenge",
          label: "Biggest challenge",
          placeholder: "What was the hardest thing you faced?",
        },
        {
          key: "additional",
          label: "Anything else you'd like to share",
          placeholder: "Optional — any other thoughts or feedback…",
        },
      ].map((field) => (
        <div key={field.key}>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
            {field.label}
          </Label>
          <Textarea
            placeholder={field.placeholder}
            className="resize-none h-[90px]"
          />
        </div>
      ))}
    </div>
  );
}

export function MultiStep() {
  const [step, setStep] = useState(1);
  const total = STEPS.length;

  const stepContent = [
    <Step1 key={1} />,
    <Step2 key={2} />,
    <Step3 key={3} />,
    <Step4 key={4} />,
    <Step5 key={5} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-600">
              Scholarship Submission
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Semester Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete all sections to submit your scholarship report
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {stepContent[step - 1]}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    s.id === step
                      ? "w-5 h-2 bg-indigo-600"
                      : s.id < step
                        ? "w-2 h-2 bg-emerald-400"
                        : "w-2 h-2 bg-slate-200"
                  )}
                />
              ))}
            </div>

            {step < total ? (
              <Button
                onClick={() => setStep((s) => Math.min(total, s + 1))}
                className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                <Check className="w-4 h-4" />
                Submit
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Step {step} of {total} · Bank details are auto-loaded from your profile
        </p>
      </div>
    </div>
  );
}
