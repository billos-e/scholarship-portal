import React from 'react';
import { Mail, Phone, Calendar, User, Edit, MapPin, Building, GraduationCap, Banknote, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import './_group.css';

const DataRow = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
    <div className="w-full sm:w-1/3 text-sm font-medium text-muted-foreground flex items-center pr-4">
      {label}
    </div>
    <div className="w-full sm:w-2/3 text-sm font-medium text-foreground flex items-center">
      {value}
    </div>
  </div>
);

const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
  <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2 mb-4 mt-8 first:mt-0">
    <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground">
      {icon}
    </div>
    {title}
  </h3>
);

export function SidebarDense() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-6">
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20 w-full" />
              <CardContent className="px-6 pb-6 pt-0 relative">
                <div className="-mt-12 mb-4 flex justify-between items-end">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">KC</AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary" className="mb-2 bg-success/15 text-success hover:bg-success/25 border-0">
                    Graduated
                  </Badge>
                </div>
                
                <div className="space-y-1 mb-6">
                  <h1 className="text-2xl font-bold tracking-tight">Kanya Chai</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> STU-2022-009
                  </p>
                </div>

                <div className="space-y-4">
                  <Button className="w-full font-medium" variant="default">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">Quick Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">kanya@student.example.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>+66 85 678 9012</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Joined Jun 1, 2020</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 min-w-0">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 md:p-8">
                
                {/* Academic Information */}
                <div>
                  <SectionHeader title="Academic Information" icon={<GraduationCap className="h-5 w-5" />} />
                  <div className="border border-border/50 rounded-lg px-4 bg-muted/10">
                    <DataRow label="University" value={<span className="font-semibold text-primary">Chulalongkorn University</span>} />
                    <DataRow label="Program" value="Medicine" />
                    <DataRow label="Year & Semester" value={
                      <div className="flex items-center gap-2">
                        <span>Year 5</span>
                        <span className="text-muted-foreground">•</span>
                        <span>Spring 2025</span>
                      </div>
                    } />
                    <DataRow label="Current GPA" value={
                      <Badge variant="outline" className="font-mono text-sm border-info/30 bg-info-light text-info">3.65</Badge>
                    } />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mt-10">
                  <SectionHeader title="Personal Information" icon={<User className="h-5 w-5" />} />
                  <div className="border border-border/50 rounded-lg px-4 bg-muted/10">
                    <DataRow label="First Name" value="Kanya" />
                    <DataRow label="Last Name" value="Chai" />
                    <DataRow label="Email Address" value="kanya@student.example.com" />
                    <DataRow label="Phone Number" value="+66 85 678 9012" />
                    <DataRow label="Student ID" value="STU-2022-009" />
                  </div>
                </div>

                {/* Bank Information */}
                <div className="mt-10">
                  <SectionHeader title="Banking Details" icon={<Building className="h-5 w-5" />} />
                  <div className="border border-border/50 rounded-lg px-4 bg-muted/10">
                    <DataRow label="Bank Name" value="Bangkok Bank" />
                    <DataRow label="Account Holder" value="Kanya Chai" />
                    <DataRow label="Account Number" value={<span className="font-mono">456-7-89012-3</span>} />
                    <DataRow label="PromptPay" value={<span className="font-mono">0856789012</span>} />
                  </div>
                </div>

                {/* Payment History */}
                <div className="mt-10">
                  <SectionHeader title="Payment History" icon={<Banknote className="h-5 w-5" />} />
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Semester</TableHead>
                          <TableHead>Amount (THB)</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Spring 2025</TableCell>
                          <TableCell className="font-mono">45,000.00</TableCell>
                          <TableCell className="text-muted-foreground">Jan 15, 2025</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-success/15 text-success hover:bg-success/25 border-0">
                              Approved
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
