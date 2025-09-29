/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  BarChart2,
  ListChecks,
  AlertTriangle,
  Gavel, // Governance/Policy
  Users, // RBAC
  Code,
  CheckCircle,
  Clock,
  Download,
  MapPin, // Geo Heatmap
  Briefcase,
  TrendingUp,
  LogOut,
  FileText,
  XCircle,
  Settings,
  Database,
  Search,
  Zap, // Automated Enforcement
  FileCog, // Legal Evidence Pack
  Locate, // Cluster Detection
  BookOpen, // Audit Log
} from "lucide-react";

// --- SHADCN/UI & RECHARTS IMPORTS (assuming standard imports) ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea"; 
import { Switch } from "@/components/ui/switch"; // For governance
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RBarChart,
  Bar,
  Legend
} from "recharts";

// ---------- MOCK DATA (Jharkhand context) ----------
const JHARKHAND_DISTRICTS = ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"];

const adminStats = {
  totalVerifications: "145.2K",
  totalFlags: 893,
  openInvestigations: 34,
  autoSuspensions: 7,
  trustScoreAvg: 91,
};

const geoFraudData = [
  { name: "Ranchi", cases: 210, color: "#ef4444" },
  { name: "Dhanbad", cases: 155, color: "#f59e0b" },
  { name: "Jamshedpur", cases: 120, color: "#10b981" },
  { name: "Bokaro", cases: 80, color: "#3b82f6" },
  { name: "Hazaribagh", cases: 50, color: "#9ca3af" },
];

const flaggedInstitutions = [
  { name: "Mock Tech Ranchi", flagged: 45, type: "Template Fraud", status: "Suspended" },
  { name: "Fake College JSR", flagged: 32, type: "Marks Mismatch", status: "Investigating" },
  { name: "Unregistered B.Ed", flagged: 19, type: "IP Cluster Fraud", status: "Flagged" },
];

const caseQueue = [
    { id: "CASE-001", certId: "JHA-4567", score: 32, status: "Open", assignee: "Singh", district: "Ranchi", flaggedOn: "2025-09-20" },
    { id: "CASE-002", certId: "JHA-8891", score: 71, status: "Review", assignee: "Verma", district: "Dhanbad", flaggedOn: "2025-09-18" },
    { id: "CASE-003", certId: "JHA-1234", score: 55, status: "Open", assignee: "Singh", district: "Bokaro", flaggedOn: "2025-09-15" },
];

const governanceRules = [
    { id: 1, rule: "Auto-Flag Threshold", description: "Trust Score ≤ 60%", enforcement: "Auto Flag", enabled: true },
    { id: 2, rule: "Auto-Investigation Trigger", description: "3+ Suspicious Certs from same IP/Template in 7 days", enforcement: "Open Case", enabled: true },
    { id: 3, rule: "Auto-Suspension Notice", description: "Flagged Institute count ≥ 50", enforcement: "Send Warning", enabled: false },
];

const rbacUsers = [
    { id: 1, name: "Pratap Singh", role: "Case Lead", department: "Vigilance", status: "Active" },
    { id: 2, name: "Anjali Verma", role: "Auditor", department: "IT", status: "Active" },
    { id: 3, name: "Rajesh Kumar", role: "Admin", department: "HE Dept.", status: "Active" },
];

// UNIQUE FEATURE: ML Pattern Clusters
const patternClusters = [
    { id: "CL-001", type: "Template B Clone", district: "Ranchi", count: 8, severity: "Critical", rationale: "8 certificates with identical template and a single-pixel tampered date field." },
    { id: "CL-002", type: "Marks Mismatch Ring", district: "Dhanbad", count: 4, severity: "High", rationale: "4 candidates from the same university batch with marks mismatched against the central DB." },
];

// ---------- Helpers ----------
const getStatusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    open: "bg-red-50 text-red-700 border-red-200",
    review: "bg-amber-50 text-amber-700 border-amber-200",
    closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    investigating: "bg-amber-100 text-amber-700",
    suspended: "bg-red-100 text-red-700",
    flagged: "bg-gray-100 text-gray-700",
    critical: "bg-red-600 text-white",
    high: "bg-amber-600 text-white",
  };
  return map[status.toLowerCase()] || "bg-muted text-muted-foreground";
};

// Custom Stat Component
const Stat = ({ title, value, icon, description, color }: any) => (
  <Card className={`shadow-lg border-t-4 ${color}`}>
    <CardContent className="flex items-start justify-between p-4">
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-3xl font-extrabold mt-1">{value}</div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </div>
      <div className="p-3 bg-muted rounded-full">{icon}</div>
    </CardContent>
  </Card>
);

// Geo-Heatmap Placeholder
const GeoHeatmap = () => (
    <div className="p-4 border rounded-lg bg-gray-50/50 shadow-inner h-full min-h-64">
        <h4 className="font-semibold mb-2 flex items-center gap-1"><MapPin className="w-4 h-4 text-primary"/> Fraud Concentration by District (Heatmap)</h4>
        <div className="space-y-2">
            {geoFraudData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium">{d.name}</div>
                    <Progress value={(d.cases / 300) * 100} className={`h-3 w-full`} style={{backgroundColor: d.color}}/>
                    <div className="w-10 text-xs text-right font-bold">{d.cases}</div>
                </div>
            ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">Note: Heatmap UI placeholder shown via proportional bars by District.</div>
    </div>
);


// ---------- Page Component ----------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<"dashboard"|"cases"|"blacklist"|"governance"|"rbac">("dashboard"); 
  const [selectedCase, setSelectedCase] = useState<any>(caseQueue[0]);

  // --- UI Helpers (Inline for scope) ---
  const NavButton = ({ children, icon, onClick, active }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted/50'}`}>
      {icon}
      <span>{children}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-primary cursor-pointer" onClick={() => navigate("/")}>Admin Console</div>
            <div className="text-xs text-muted-foreground">Jharkhand HE Dept.</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavButton active={active==='dashboard'} onClick={() => setActive('dashboard')} icon={<LayoutDashboard className="w-5 h-5"/>}>Dashboard (KPIs)</NavButton>
          <NavButton active={active==='cases'} onClick={() => setActive('cases')} icon={<ListChecks className="w-5 h-5"/>}>Case & Investigation</NavButton>
          <NavButton active={active==='blacklist'} onClick={() => setActive('blacklist')} icon={<AlertTriangle className="w-5 h-5"/>}>Blacklist Management</NavButton>
          <NavButton active={active==='governance'} onClick={() => setActive('governance')} icon={<Gavel className="w-5 h-5"/>}>Governance & Policy</NavButton>
          <NavButton active={active==='rbac'} onClick={() => setActive('rbac')} icon={<Users className="w-5 h-5"/>}>RBAC & Audit Logs</NavButton>
        </nav>

        <div className="mt-6 border-t pt-4">
          <Button variant="outline" className="w-full mb-2" onClick={() => navigate('/')}> <LogOut className="w-4 h-4 mr-2"/> Logout</Button>
          <Button className="w-full" variant="secondary" onClick={() => alert('Open account settings (demo)')}> <Settings className="w-4 h-4 mr-2"/> Settings</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-auto">
        <header className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-extrabold text-primary/80">Central Monitoring Dashboard</h1>
            <p className="text-sm text-muted-foreground">Critical oversight for the Authenticity Validator Program.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Problem Statement ID</div>
              <div className="font-semibold flex items-center gap-1 text-red-600">
                <FileText className="w-3 h-3"/> ID25029
              </div>
            </div>
          </div>
        </header>

        {/* --- 1. Dashboard (KPIs & Charts) --- */}
        {active==='dashboard' && (
          <>
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Stat title="Total Verifications YTD" value={adminStats.totalVerifications} description="High velocity of public use" icon={<Shield className="w-6 h-6 text-primary"/>} color="border-primary"/>
              <Stat title="Total Flagged Cases" value={adminStats.totalFlags} description="Cases requiring deep forensics" icon={<AlertTriangle className="w-6 h-6 text-red-600"/>} color="border-red-600"/>
              <Stat title="Open Investigations" value={adminStats.openInvestigations} description="Active cases assigned to leads" icon={<Clock className="w-6 h-6 text-amber-600"/>} color="border-amber-600"/>
              <Stat title="Auto-Suspensions" value={adminStats.autoSuspensions} description="Enforcement actions taken by policy engine" icon={<Zap className="w-6 h-6 text-emerald-600"/>} color="border-emerald-600"/>
            </section>
            
            <section className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5"/> Trend Analysis & Geo-Focus</h2>
                <div className="grid md:grid-cols-3 gap-6 h-96">
                    {/* Geo-Heatmap Placeholder (Winning Feature) */}
                    <Card className="shadow-lg md:col-span-1">
                        <CardContent className="h-full pt-6">
                            <GeoHeatmap/>
                        </CardContent>
                    </Card>

                    {/* Trust Score Distribution Chart */}
                    <Card className="shadow-lg md:col-span-1">
                        <CardHeader><CardTitle>Avg Trust Score Distribution</CardTitle></CardHeader>
                        <CardContent className="h-64 flex items-center justify-center pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={geoFraudData} dataKey="cases" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4} fill="#8884d8">
                                        {geoFraudData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                                    </Pie>
                                    <ReTooltip formatter={(value: number, name: string) => [`${value} cases`, name]}/>
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    
                    {/* Top Flagged Institutions */}
                    <Card className="shadow-lg md:col-span-1">
                        <CardHeader><CardTitle>Top Flagged Entities (Current)</CardTitle></CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            {flaggedInstitutions.map((inst, i) => (
                                <div key={i} className="p-3 border rounded-lg flex justify-between items-center bg-muted/10">
                                    <div>
                                        <div className="font-semibold text-sm">{inst.name}</div>
                                        <div className="text-xs text-muted-foreground">{inst.type}</div>
                                    </div>
                                    <Badge className={getStatusBadgeClass(inst.status)}>{inst.status}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>
          </>
        )}

        {/* --- 2. Case & Investigation Console --- */}
        {active==='cases' && (
            <section className="grid md:grid-cols-3 gap-6">
                
                {/* Case Queue Table */}
                <Card className="md:col-span-2 shadow-xl">
                    <CardHeader><CardTitle>Investigation Case Queue ({caseQueue.length} Open)</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-auto max-h-[60vh]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Case ID / Cert ID</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Assignee</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {caseQueue.map(c => (
                                        <TableRow key={c.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedCase(c)}>
                                            <TableCell className="font-medium">
                                                <div className="font-bold">{c.id}</div>
                                                <div className="text-xs text-muted-foreground truncate">{c.certId}</div>
                                            </TableCell>
                                            <TableCell>{c.district}</TableCell>
                                            <TableCell>{c.score}%</TableCell>
                                            <TableCell><Badge variant="secondary">{c.assignee}</Badge></TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={getStatusBadgeClass(c.status)}>{c.status.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => setSelectedCase(c)}>Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Case Details & Actions Panel */}
                <Card className="md:col-span-1 shadow-xl sticky top-0">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="flex items-center gap-2">Case Management ({selectedCase.id})</CardTitle>
                        <CardDescription>Assign directives, attach findings, and manage status.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="text-sm">
                            <div className="font-bold">Flagged On:</div>
                            <div className="text-muted-foreground">{selectedCase.flaggedOn}</div>
                        </div>
                        <div className="text-sm">
                            <div className="font-bold">Current Status:</div>
                            <Badge className={getStatusBadgeClass(selectedCase.status)}>{selectedCase.status.toUpperCase()}</Badge>
                        </div>

                        <Textarea rows={4} placeholder="Add official investigation notes / directives here..."></Textarea>

                        <div className="space-y-2 pt-2 border-t">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={()=> alert(`Case ${selectedCase.id} closed and marked legitimate (demo)`)}><CheckCircle className="w-4 h-4 mr-2"/> Close Case (Legitimate)</Button>
                            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={()=> alert(`Case ${selectedCase.id} closed and marked fraudulent (demo)`)}><XCircle className="w-4 h-4 mr-2"/> Close Case (Fraudulent)</Button>
                            <Button variant="outline" className="w-full" onClick={()=> alert(`Evidence attached for Case ${selectedCase.id} (demo)`)}><FileText className="w-4 h-4 mr-2"/> Attach Forensic Evidence</Button>
                        </div>

                        {/* Legal Evidence Pack Builder (Winning Feature) */}
                        <div className="pt-4 border-t border-dashed">
                            <h5 className="font-bold mb-2 flex items-center gap-2 text-primary"><FileCog className="w-4 h-4"/> Legal Evidence Pack Builder</h5>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full" variant="secondary"><Download className="w-4 h-4 mr-2"/> Export Legal Bundle</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Export Legal Evidence Pack</DialogTitle></DialogHeader>
                                    <p className="text-sm">Generate a single, cryptographically signed manifest bundle containing all evidence for case <b>{selectedCase.id}</b>.</p>
                                    <Button onClick={()=> alert('Legal bundle exported with signed manifest (demo)')}>Confirm & Generate Signed Pack</Button>
                                </DialogContent>
                            </Dialog>
                            <p className="text-xs text-muted-foreground mt-2">Creates immutable, chain-of-custody manifest.</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        )}

        {/* --- 3. Blacklist Management --- */}
        {active==='blacklist' && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Blacklist Management & Pattern Discovery</h2>
            <p className="text-sm text-muted-foreground">Manage banned entities and leverage ML insights to preemptively detect fraud rings.</p>
            
            {/* Pattern Discovery ML Clusters (Winning Feature) */}
            <Card className="shadow-lg border-l-4 border-primary">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2 text-primary"><Locate className="w-5 h-5"/> Pattern Discovery ML Clusters</CardTitle>
                    <CardDescription>Automatic "Ring" detection by clustering suspicious certificates.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {patternClusters.map((cluster, i) => (
                        <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-sm flex items-center gap-2">
                                    <Badge className={getStatusBadgeClass(cluster.severity.toLowerCase())} variant="default">{cluster.severity}</Badge>
                                    {cluster.type}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{cluster.rationale}</div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <div className="font-bold text-lg">{cluster.count}</div>
                                <Button size="sm" variant="link" onClick={()=> alert(`Opening all ${cluster.count} linked cases (demo)`)}>View Linked</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Blacklist Table */}
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Blacklisted Entities & Suspension Status</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Institution Name</TableHead>
                                <TableHead>District</TableHead>
                                <TableHead>Reason / Rationale</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flaggedInstitutions.map((inst, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{inst.name}</TableCell>
                                    <TableCell>{JHARKHAND_DISTRICTS[i % JHARKHAND_DISTRICTS.length]}</TableCell>
                                    <TableCell>{inst.type}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={getStatusBadgeClass(inst.status)}>{inst.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" className="mr-2" onClick={()=> alert(`Auditing ${inst.name}'s policy (demo)`)}><Settings className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="destructive" onClick={()=> alert(`Removing ${inst.name} from blacklist (demo)`)}>Remove</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </section>
        )}

        {/* --- 4. Governance & Policy --- */}
        {active==='governance' && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Gavel className="w-5 h-5"/> Governance & Automated Policy Engine</h2>
            <p className="text-sm text-muted-foreground">Manage the rules that govern automated flagging, investigation triggers, and enforcement actions.</p>
            
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Enforcement Policy Rules</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/4">Rule Name</TableHead>
                                <TableHead className="w-1/2">Description / Threshold</TableHead>
                                <TableHead>Automated Enforcement</TableHead>
                                <TableHead className="text-center">Enabled</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {governanceRules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.rule}</TableCell>
                                    <TableCell>{rule.description}</TableCell>
                                    <TableCell><Badge variant="secondary">{rule.enforcement}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <Switch checked={rule.enabled} onCheckedChange={()=> alert(`Toggling rule ${rule.id} (demo)`)}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Automated Enforcement & Alerts (Winning Feature) */}
            <Card className="shadow-lg border-l-4 border-red-600">
                <CardHeader className="bg-red-50/50">
                    <CardTitle className="flex items-center gap-2 text-red-700"><Zap className="w-5 h-5"/> Automated Enforcement & Alerts</CardTitle>
                    <CardDescription>Immediate, automated actions on policy breaches (e.g., temporary suspension).</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Button className="w-full bg-red-600 hover:bg-red-700" onClick={()=> alert('Auto-issuing TEMPORARY Suspension for Mock Tech Ranchi (demo)')}>
                            <XCircle className="w-4 h-4 mr-2"/> Auto-Suspend Institution (Test)
                        </Button>
                        <Button variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50" onClick={()=> alert('Auto-issuing official warning notice (demo)')}>
                            <AlertTriangle className="w-4 h-4 mr-2"/> Send Official Warning Notice
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">All automated enforcement actions require a clear audit trail and are subject to immediate administrative override.</div>
                </CardContent>
            </Card>
          </section>
        )}

        {/* --- 5. RBAC & Audit Logs --- */}
        {active==='rbac' && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5"/> Role-Based Access Control (RBAC)</h2>
            <p className="text-sm text-muted-foreground">Manage user roles, privileges, and maintain the immutable audit trail for all sensitive actions.</p>
            
            <Card className="shadow-lg">
                <CardHeader><CardTitle>User & Role Management</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rbacUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.department}</TableCell>
                                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge className="bg-emerald-100 text-emerald-700">{user.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" className="mr-2" onClick={()=> alert(`Editing role for ${user.name} (demo)`)}>Edit</Button>
                                        <Button size="sm" variant="destructive" onClick={()=> alert(`Suspending access for ${user.name} (demo)`)}>Suspend</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-amber-600">
                <CardHeader className="bg-amber-50/50">
                    <CardTitle className="flex items-center gap-2 text-amber-700"><BookOpen className="w-5 h-5"/> Immutable Audit Logs</CardTitle>
                    <CardDescription>Access an immutable, timestamped record of all sensitive operations.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-xs font-mono bg-muted p-3 rounded-lg max-h-48 overflow-auto">
                        <p className="text-amber-700">10:45:21Z | User: RKumar (Admin) | Action: OPEN_CASE | CaseID: CASE-001 | TS: 1678886721</p>
                        <p>10:44:02Z | User: PSingh (Case Lead) | Action: VIEW_PII | CertID: JHA-4567 | Purpose: Investigation</p>
                        <p className="text-red-700">10:43:55Z | Policy Engine | Action: AUTO_FLAG | CertID: JHA-4567 | RuleID: 1 (Score below 60)</p>
                        <p>10:43:01Z | User: AVerma (Auditor) | Action: LOGIN_SUCCESS</p>
                        <p>10:42:15Z | User: RKumar (Admin) | Action: MODIFY_RULE | RuleID: 3 | NewValue: Enabled=false</p>
                        <p>10:40:00Z | System | Action: HOURLY_CRON | Description: Pattern Discovery ML Job Run</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">All logs include immutable timestamps (TS) and role context for compliance.</p>
                        <Button size="sm" variant="outline"><Search className="w-4 h-4 mr-2"/> Filter Logs</Button>
                    </div>
                </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}