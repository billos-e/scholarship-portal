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
import type { LucideIcon } from 'lucide-react';

const SECTIONS = [
  { icon: Calendar, title: 'Semester', description: "Term you're reporting" },
  { icon: Wallet, title: 'Tuition', description: 'Invoice & payment details' },
  { icon: Landmark, title: 'Bank', description: 'Payout account info' },
  { icon: GraduationCap, title: 'Academic', description: 'GPA & transcript' },
  { icon: Heart, title: 'Wellbeing', description: "How you're doing" },
  { icon: BookOpen, title: 'Reflections', description: 'Your semester story' },
];

function SectionPill({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-l border-[#e4e4e7] pl-4 py-1">
      <Icon className="size-4 text-[#71717a] stroke-[1.5]" />
      <div className="space-y-1">
        <p className="font-serif text-[14px] font-medium text-[#18181b] tracking-wide">{title}</p>
        <p className="text-[11px] text-[#71717a] uppercase tracking-wider">{description}</p>
      </div>
    </div>
  );
}

export function Quiet() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#18181b] p-6 sm:p-12">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}} />
      
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Hero Header */}
        <section className="bg-white border border-[#e4e4e7] p-8 sm:p-12">
          <div className="flex flex-col gap-8">
            
            {/* Top Area */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-[#e4e4e7] pb-8">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[#52525b]">
                  <Sparkles className="size-3.5 stroke-[1.5]" />
                  <span>Semester submission</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#09090b]">
                  New Submission
                </h1>
                <p className="text-[14px] leading-relaxed text-[#52525b] font-serif italic text-lg max-w-xl">
                  Hi Somchai — submit your tuition payment request and semester report together. Fill in each
                  section below; required fields are marked with an asterisk.
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3 text-right">
                <div className="inline-flex items-center gap-2 text-[12px] text-[#3f3f46]">
                  <Building2 className="size-3.5 stroke-[1.5]" />
                  <span>Chulalongkorn University</span>
                </div>
                <div className="inline-flex items-center gap-2 text-[12px] text-[#3f3f46]">
                  <Calendar className="size-3.5 stroke-[1.5]" />
                  <span>Summer 2026</span>
                </div>
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-6 pt-4">
              {SECTIONS.map((section) => (
                <SectionPill key={section.title} {...section} />
              ))}
            </div>

            {/* Privacy Note */}
            <div className="mt-4 flex items-start gap-4 border border-[#e4e4e7] bg-[#fefefe] p-5">
              <Shield className="size-5 shrink-0 text-[#71717a] stroke-[1.5]" />
              <div className="space-y-1">
                <p className="font-serif text-[15px] font-medium text-[#18181b]">Confidentiality Notice</p>
                <p className="text-[12px] leading-relaxed text-[#71717a]">
                  Only you and the scholarship team can view this submission. Your information stays private.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Status Card */}
        <section className="bg-white border border-[#e4e4e7]">
          <div className="flex flex-col items-center gap-6 py-16 px-6 text-center">
            <AlertCircle className="size-6 text-[#71717a] stroke-[1.5]" />
            
            <div className="space-y-3 max-w-md">
              <h2 className="font-serif text-2xl font-medium text-[#18181b]">Submission not available yet</h2>
              <p className="text-[14px] leading-relaxed text-[#52525b]">
                You already have an active payment request in progress.
              </p>
            </div>

            <div className="w-full max-w-md space-y-4 border border-[#e4e4e7] bg-[#fafafa] p-6 text-left mt-4">
              <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-4 text-[#71717a] stroke-[1.5]" />
                  <p className="font-serif text-[15px] font-medium text-[#18181b]">Summer 2026</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#52525b] border border-[#e4e4e7] px-2 py-1 bg-white">
                  Submitted
                </span>
              </div>
              
              <p className="text-[13px] leading-relaxed text-[#71717a]">
                Wait until this request is marked paid or rejected before submitting again.
              </p>
              
              <button className="mt-2 w-full border border-[#18181b] bg-[#18181b] text-white px-4 py-2.5 text-[13px] font-medium tracking-wide transition-colors hover:bg-white hover:text-[#18181b]">
                View current request
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
