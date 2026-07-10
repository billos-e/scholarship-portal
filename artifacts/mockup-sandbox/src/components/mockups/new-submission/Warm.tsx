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
  { icon: Calendar, title: 'Semester', description: "Term you're reporting", tone: 'primary' as const },
  { icon: Wallet, title: 'Tuition', description: 'Invoice & payment details', tone: 'accent' as const },
  { icon: Landmark, title: 'Bank', description: 'Payout account info', tone: 'info' as const },
  { icon: GraduationCap, title: 'Academic', description: 'GPA & transcript', tone: 'primary' as const },
  { icon: Heart, title: 'Wellbeing', description: "How you're doing", tone: 'accent' as const },
  { icon: BookOpen, title: 'Reflections', description: 'Your semester story', tone: 'info' as const },
];

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function SectionPill({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: 'primary' | 'accent' | 'info';
}) {
  const toneStyles = {
    primary: {
      bg: 'bg-[#e6b8a2]/30',
      icon: 'text-[#c25e36]',
      border: 'hover:border-[#e6b8a2]',
    },
    accent: {
      bg: 'bg-[#f2cc8f]/30',
      icon: 'text-[#b5812a]',
      border: 'hover:border-[#f2cc8f]',
    },
    info: {
      bg: 'bg-[#81b29a]/20',
      icon: 'text-[#4c8266]',
      border: 'hover:border-[#81b29a]',
    },
  }[tone];

  return (
    <div className={cn("rounded-[1.5rem] bg-[#fdfbf7] p-4 transition-all duration-300 border border-[#f0eae1] hover:shadow-md hover:-translate-y-1", toneStyles.border)}>
      <div className="flex flex-col gap-3">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl', toneStyles.bg, toneStyles.icon)}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="font-sans text-[15px] font-semibold text-[#3d2b1f]">{title}</p>
          <p className="text-sm text-[#8c7b6d]">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function Warm() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');
      `}} />
      
      <div 
        className="min-h-screen p-6 md:p-10"
        style={{ 
          backgroundColor: '#fcf9f2', 
          fontFamily: '"DM Sans", sans-serif',
          color: '#3d2b1f'
        }}
      >
        <div className="mx-auto max-w-5xl space-y-8">
          
          <section className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 md:p-12 shadow-[0_8px_40px_rgb(61,43,31,0.03)] border border-[#f0eae1]">
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#f2cc8f] opacity-20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-[#e6b8a2] opacity-15 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3 pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 space-y-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#fdfbf7] border border-[#e6b8a2]/40 px-4 py-1.5 text-sm font-medium text-[#c25e36]">
                    <Sparkles className="size-4" />
                    Semester submission
                  </div>
                  <div className="space-y-3">
                    <h1 
                      className="text-4xl md:text-5xl font-semibold tracking-tight text-[#2d1e12]"
                      style={{ fontFamily: '"Fraunces", serif' }}
                    >
                      New Submission
                    </h1>
                    <p className="text-lg leading-relaxed text-[#6b5c51]">
                      Hi Somchai — submit your tuition payment request and semester report together. Fill in each
                      section below; required fields are marked with an asterisk.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col items-start lg:items-end">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-[#fdfbf7] border border-[#f0eae1] px-4 py-2.5 text-sm font-medium text-[#6b5c51] shadow-sm">
                    <Building2 className="size-4 text-[#81b29a]" />
                    Chulalongkorn University
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-[#fdfbf7] border border-[#f0eae1] px-4 py-2.5 text-sm font-medium text-[#6b5c51] shadow-sm">
                    <Calendar className="size-4 text-[#e07a5f]" />
                    Summer 2026
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
                {SECTIONS.map((section) => (
                  <SectionPill key={section.title} {...section} />
                ))}
              </div>

              <div className="flex items-start gap-4 rounded-[1.5rem] border border-[#81b29a]/20 bg-[#81b29a]/5 p-5 md:p-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#81b29a]/20 text-[#4c8266]">
                  <Shield className="size-6" />
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-[17px] font-medium text-[#3d2b1f]">Your information stays private</p>
                  <p className="text-[15px] leading-relaxed text-[#6b5c51]">
                    Only you and the scholarship team can view this submission.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-[#f0eae1] bg-white shadow-[0_8px_40px_rgb(61,43,31,0.03)] px-6 py-16 md:px-12 flex flex-col items-center text-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-[#e07a5f]/10 text-[#e07a5f] mb-6">
              <AlertCircle className="size-10" />
            </div>
            
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-4 text-[#2d1e12]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Submission not available yet
            </h2>

            <p className="max-w-md text-lg leading-relaxed text-[#6b5c51]">
              You already have an active payment request in progress.
            </p>

            <div className="w-full max-w-md mt-10 rounded-[2rem] border border-[#f0eae1] bg-[#fdfbf7] p-8 text-left space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm border border-[#f0eae1]">
                    <ClipboardList className="size-5 text-[#8c7b6d]" />
                  </div>
                  <p className="text-base font-medium text-[#3d2b1f]">Summer 2026</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#f2cc8f]/30 px-3 py-1 text-xs font-bold text-[#b5812a] uppercase tracking-wider">
                  Submitted
                </span>
              </div>
              <p className="text-base leading-relaxed text-[#6b5c51]">
                Wait until this request is marked paid or rejected before submitting again.
              </p>
              <button className="w-full inline-flex items-center justify-center rounded-2xl bg-white border border-[#e07a5f]/20 px-6 py-3.5 text-[15px] font-medium text-[#c25e36] shadow-sm hover:bg-[#e07a5f]/5 transition-colors focus:ring-4 focus:ring-[#e07a5f]/20 outline-none">
                View current request
              </button>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
