import React from 'react';
import './_group.css';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  GraduationCap,
  Landmark,
  Mail,
  Pencil,
  Phone,
  Receipt,
  User,
  CreditCard,
  Building2,
  Clock
} from 'lucide-react';

export function Timeline() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-white shadow-md">
              <AvatarFallback className="bg-foreground text-primary-foreground text-2xl font-medium">KC</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-semibold tracking-tight">Kanya Chai</h1>
                <Badge variant="secondary" className="bg-success-light text-success hover:bg-success-light/80 rounded-full px-3 border-transparent">
                  Graduated
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Chulalongkorn University • Medicine
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 rounded-full px-6">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Timeline Column */}
          <main className="lg:col-span-8">
            <h2 className="text-xl font-semibold mb-8 tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Student Journey
            </h2>
            
            <div className="relative border-l border-border ml-4 space-y-12 pb-8">
              
              {/* Event: Graduation */}
              <div className="relative pl-8">
                <div className="absolute -left-3.5 top-1 h-7 w-7 rounded-full bg-success-light border-4 border-background flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Present</div>
                <Card className="shadow-sm border-border">
                  <CardContent className="p-5 flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-success-light flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Graduated</h3>
                      <p className="text-muted-foreground text-sm mt-1">Successfully completed the Medicine program at Chulalongkorn University.</p>
                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                         <div className="flex items-center gap-1.5"><Badge variant="outline">Final GPA: 3.65</Badge></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event: Payment Request */}
              <div className="relative pl-8">
                <div className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-info-light border-4 border-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-info-light0" />
                </div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Jan 15, 2025</div>
                <Card className="shadow-sm border-border">
                  <CardContent className="p-5 flex gap-4">
                     <div className="h-10 w-10 rounded-full bg-info-light flex items-center justify-center shrink-0">
                      <Receipt className="h-5 w-5 text-info" />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-foreground">Payment Request Approved</h3>
                        <Badge variant="secondary" className="bg-info-light text-info hover:bg-info-light border-transparent">Approved</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">Spring 2025 semester tuition fee requested.</p>
                      <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between border border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Amount</p>
                          <p className="font-medium text-foreground">THB 45,000.00</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Semester</p>
                          <p className="font-medium text-foreground">Spring 2025</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Event: Academic Update */}
              <div className="relative pl-8">
                <div className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                </div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Fall 2024</div>
                <Card className="shadow-sm border-border border-dashed bg-background">
                  <CardContent className="p-5 flex gap-4">
                     <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Academic Progress</h3>
                      <p className="text-muted-foreground text-sm mt-1">Entered Year 5. Maintained GPA of 3.65.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event: Initial Enrollment */}
              <div className="relative pl-8">
                <div className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                </div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Jun 1, 2020</div>
                <Card className="shadow-sm border-border bg-muted/30">
                  <CardContent className="p-5 flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Profile Created</h3>
                      <p className="text-muted-foreground text-sm mt-1">Student ID STU-2022-009 assigned.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </main>

          {/* Sticky Side Panel */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            
            <Card className="shadow-sm border-border overflow-hidden">
              <div className="h-1 bg-foreground w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Email Address</p>
                    <p className="font-medium text-foreground">kanya@student.example.com</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Phone Number</p>
                    <p className="font-medium text-foreground">+66 85 678 9012</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Member Since</p>
                    <p className="font-medium text-foreground">Jun 1, 2020</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border overflow-hidden">
              <div className="h-1 bg-info w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  Banking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Bank Name</p>
                  <p className="font-medium text-foreground">Bangkok Bank</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Account Holder</p>
                  <p className="font-medium text-foreground">Kanya Chai</p>
                </div>
                <Separator />
                <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-xs">Account Number</p>
                  </div>
                  <p className="font-mono font-medium text-foreground">456-7-89012-3</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                  <p className="text-muted-foreground text-xs mb-1">PromptPay</p>
                  <p className="font-mono font-medium text-foreground">0856789012</p>
                </div>
              </CardContent>
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
}
