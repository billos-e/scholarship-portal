import React from 'react';
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  GraduationCap,
  Heart,
  Landmark,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';

const SECTIONS = [
  { icon: Calendar, title: 'Semester', description: "Term you're reporting", color: '#ffb3ba', fg: '#b91c1c' },
  { icon: Wallet, title: 'Tuition', description: 'Invoice & payment details', color: '#ffdfba', fg: '#b45309' },
  { icon: Landmark, title: 'Bank', description: 'Payout account info', color: '#baffc9', fg: '#15803d' },
  { icon: GraduationCap, title: 'Academic', description: 'GPA & transcript', color: '#bae1ff', fg: '#1d4ed8' },
  { icon: Heart, title: 'Wellbeing', description: "How you're doing", color: '#e2cbff', fg: '#6d28d9' },
  { icon: BookOpen, title: 'Reflections', description: 'Your semester story', color: '#ffb347', fg: '#c2410c' },
];

export function Bright() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .shadow-brutal { box-shadow: 4px 4px 0px 0px rgba(0,0,0,1); }
        .shadow-brutal-sm { box-shadow: 2px 2px 0px 0px rgba(0,0,0,1); }
      `}</style>
      
      <div className="min-h-screen font-jakarta bg-[#fdf8f5] text-slate-900 p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Header section */}
          <section className="bg-white rounded-3xl border-2 border-slate-900 shadow-brutal overflow-hidden">
            <div className="bg-[#a7f3d0] border-b-2 border-slate-900 p-6 sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-900 shadow-brutal-sm">
                    <Sparkles className="size-4 text-emerald-600" />
                    Semester submission
                  </div>
                  <div className="space-y-2">
                    <h1 className="font-bricolage text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                      New Submission
                    </h1>
                    <p className="max-w-2xl text-[15px] sm:text-base font-medium leading-relaxed text-slate-700">
                      Hi Somchai — submit your tuition payment request and semester report together. Fill in each
                      section below; required fields are marked with an asterisk.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-[#fde047] px-4 py-2 text-sm font-bold text-slate-900 shadow-brutal-sm">
                    <Building2 className="size-4" />
                    Chulalongkorn University
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-[#c7d2fe] px-4 py-2 text-sm font-bold text-slate-900 shadow-brutal-sm">
                    <Calendar className="size-4" />
                    Summer 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {SECTIONS.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="relative group">
                      <div 
                        className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1 translate-y-1 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"
                      />
                      <div className="relative h-full border-2 border-slate-900 bg-white p-4 rounded-2xl flex flex-col gap-3 transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">
                        <div 
                          className="flex size-10 items-center justify-center rounded-xl border-2 border-slate-900"
                          style={{ backgroundColor: section.color, color: section.fg }}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-bricolage text-[15px] font-bold text-slate-900 leading-tight">
                            {section.title}
                          </p>
                          <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-4 rounded-2xl border-2 border-slate-900 bg-[#fbcfe8] px-5 py-4 shadow-brutal-sm">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white border-2 border-slate-900 text-pink-600 shadow-brutal-sm">
                  <Shield className="size-6" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <p className="font-bricolage text-lg font-bold text-slate-900">Your information stays private</p>
                  <p className="text-[14px] font-medium text-slate-700">
                    Only you and the scholarship team can view this submission.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Blocked State */}
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2" />
            <div className="relative rounded-3xl border-2 border-slate-900 bg-white p-8 sm:p-12 text-center flex flex-col items-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-[#fecaca] text-red-600 shadow-brutal-sm mb-6">
                <AlertCircle className="size-8" />
              </div>
              
              <h2 className="font-bricolage text-3xl font-extrabold text-slate-900 mb-3">
                Submission not available yet
              </h2>
              
              <p className="max-w-md text-base font-medium text-slate-600 mb-8">
                You already have an active payment request in progress.
              </p>

              <div className="w-full max-w-md rounded-2xl border-2 border-slate-900 bg-[#f1f5f9] p-5 text-left shadow-brutal-sm relative">
                <div className="flex items-center gap-3 mb-3">
                  <ClipboardList className="size-5 text-slate-700" />
                  <p className="font-bricolage text-lg font-bold text-slate-900">Summer 2026</p>
                  <span className="inline-flex items-center rounded-full border-2 border-slate-900 bg-[#bfdbfe] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-900">
                    Submitted
                  </span>
                </div>
                <p className="text-[14px] font-medium text-slate-600 mb-5 leading-relaxed">
                  Wait until this request is marked paid or rejected before submitting again.
                </p>
                <button className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border-2 border-slate-900 bg-[#fcd34d] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-slate-900 transition-transform hover:-translate-y-0.5 shadow-brutal-sm hover:shadow-brutal active:translate-y-0 active:shadow-none">
                  View current request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
