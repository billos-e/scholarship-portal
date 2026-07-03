import React, { useState } from "react";
import "./_group.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Edit,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Landmark,
  GraduationCap,
  Building,
  User,
  Hash,
  Clock,
  ChevronRight
} from "lucide-react";

export function Tabbed() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Fixed Hero Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-background">
              <AvatarFallback className="bg-success-light text-success text-2xl font-semibold">
                KC
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                Kanya Chai
                <Badge variant="outline" className="bg-success-light text-success border-border hover:bg-success-light">
                  Graduated
                </Badge>
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Hash className="w-4 h-4" /> STU-2022-009</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Member since Jun 1, 2020</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button variant="outline" className="gap-2 bg-card">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="w-full">
          <div className="flex flex-wrap md:inline-flex items-center justify-center p-1 bg-muted border border-border/60 rounded-xl mb-6">
            {["overview", "academic", "banking", "payments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground font-medium">First Name</div>
                        <div className="mt-1 font-medium">Kanya</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground font-medium">Last Name</div>
                        <div className="mt-1 font-medium">Chai</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground font-medium">Email Address</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" /> kanya@student.example.com
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground font-medium">Phone Number</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" /> +66 85 678 9012
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-muted-foreground" />
                        Academic Snapshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
                          <span className="text-sm text-muted-foreground">Program</span>
                          <span className="font-medium text-right">Medicine</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
                          <span className="text-sm text-muted-foreground">University</span>
                          <span className="font-medium text-right">Chulalongkorn University</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
                          <span className="text-sm text-muted-foreground">Current Year</span>
                          <span className="font-medium text-right">Year 5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in">
               <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-5 h-5 text-muted-foreground" />
                      Academic Details
                    </CardTitle>
                    <CardDescription>Current enrollment and academic standing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground font-medium mb-1">University</div>
                          <div className="font-medium text-base p-3 bg-muted/30 rounded-lg border border-border/60">
                            Chulalongkorn University
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground font-medium mb-1">Program of Study</div>
                          <div className="font-medium text-base p-3 bg-muted/30 rounded-lg border border-border/60">
                            Medicine
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground font-medium mb-1">Year</div>
                            <div className="font-medium text-base p-3 bg-muted/30 rounded-lg border border-border/60">
                              5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground font-medium mb-1">Semester</div>
                            <div className="font-medium text-base p-3 bg-muted/30 rounded-lg border border-border/60">
                              Spring 2025
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground font-medium mb-1">Current GPA</div>
                          <div className="font-medium text-base p-3 bg-success-light text-success rounded-lg border border-border/60 inline-block">
                            3.65
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}

          {activeTab === "banking" && (
            <div className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in">
               <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-muted-foreground" />
                      Banking Information
                    </CardTitle>
                    <CardDescription>Primary account for scholarship disbursements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="p-5 border border-border rounded-xl bg-gradient-to-br from-card to-muted/30 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                               <Landmark className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="font-semibold">Bangkok Bank</div>
                               <div className="text-xs text-muted-foreground">Primary Account</div>
                             </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Account Holder</div>
                              <div className="font-medium">Kanya Chai</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Account Number</div>
                              <div className="font-mono text-lg tracking-tight">456-7-89012-3</div>
                            </div>
                          </div>
                       </div>

                       <div className="p-5 border border-border rounded-xl bg-gradient-to-br from-card to-muted/30 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                               <CreditCard className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="font-semibold">PromptPay</div>
                               <div className="text-xs text-muted-foreground">Linked to Phone Number</div>
                             </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Registered Number</div>
                              <div className="font-mono text-lg tracking-tight">0856789012</div>
                            </div>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in">
               <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      Payment History
                    </CardTitle>
                    <CardDescription>Past and upcoming scholarship disbursements</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/50 border-t border-border">
                        <TableRow>
                          <TableHead className="w-[180px]">Semester</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Spring 2025</TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Jan 15, 2025
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">THB 45,000.00</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-success-light text-success border-border">
                              Approved
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              View <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
