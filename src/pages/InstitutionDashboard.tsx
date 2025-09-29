/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/InstitutionDashboard.tsx
import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Upload,
  KeyRound,
  MessageSquare,
  BarChart4,
  CheckCircle,
  Clock,
  Gauge,
  AlertTriangle,
  LogOut,
  Settings,
  Shield,
  FileText,
  Scan,
  RotateCw,
  XCircle,
  Zap,
  GraduationCap,
  ChevronRight,
  Plus,
  Edit,
  Archive,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// --- SHADCN/UI & RECHARTS IMPORTS (Minimalist Components) ---
const Card = (props: any) => (
  <div
    className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm"
    {...props}
  />
);
const CardContent = (props: any) => (
  <div className="p-5 pt-0" {...props} />
);
const CardHeader = (props: any) => (
  <div className="flex flex-col space-y-1 p-5" {...props} />
);
const CardTitle = (props: any) => (
  <h3 className="text-lg font-bold tracking-tight" {...props} />
);
const CardDescription = (props: any) => (
  <p className="text-sm text-gray-500" {...props} />
);

const Button = (props: any) => {
  const baseClass =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3.5 py-2 shadow-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";
  let variantClass = "";

  switch (props.variant) {
    case "secondary":
      variantClass = "bg-white text-gray-700 hover:bg-gray-200";
      break;
    case "destructive":
      variantClass = "bg-red-600 text-white hover:bg-red-700";
      break;
    case "outline":
      variantClass =
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
      break;
    default:
      variantClass = "bg-blue-600 text-white hover:bg-blue-700";
      break;
  }
  return (
    <button
      className={`${baseClass} ${variantClass} ${props.className || ""}`}
      {...props}
    />
  );
};

const Badge = (props: any) => (
  <div
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none border border-transparent ${props.className || ""}`}
    {...props}
  />
);
const Input = (props: any) => (
  <input
    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);
const Progress = (props: any) => (
  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
    <div
      style={{ width: `${props.value}%`, backgroundColor: props.color || "#3b82f6" }}
      className="h-full transition-all duration-700 rounded-full"
    ></div>
  </div>
);
const Table = (props: any) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm" {...props} />
  </div>
);
const TableHeader = (props: any) => (
  <thead className="[&_tr]:border-b border-gray-200 bg-gray-50" {...props} />
);
const TableBody = (props: any) => (
  <tbody className="[&_tr:last-child]:border-0" {...props} />
);
const TableRow = (props: any) => (
  <tr
    className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100"
    {...props}
  />
);
const TableHead = (props: any) => (
  <th
    className="h-10 px-4 py-3 text-left align-middle font-semibold text-gray-700 [&:has([role=checkbox])]:pr-0"
    {...props}
  />
);
const TableCell = (props: any) => (
  <td
    className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0"
    {...props}
  />
);

import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  Legend,
  Area,
} from "recharts";

// ---------- MOCK DATA ----------
const kpis = {
  issued: 15400,
  quota: 25000,
  templates: 8,
  disputes: 12,
  trustScore: 92,
  syncStatus: "Live",
  retroactive: 250,
};

const templates = [
  {
    id: 1,
    name: "B.Tech CSE Degree",
    fields: 6,
    lastUpdated: "2025-09-10",
    status: "Active",
    image: "/btech-cert-template.png",
  },
  {
    id: 2,
    name: "MBA Completion Cert.",
    fields: 4,
    lastUpdated: "2025-08-20",
    status: "Active",
    image: "/mba-cert-template.png",
  },
  {
    id: 3,
    name: "B.Sc Final Marksheet",
    fields: 10,
    lastUpdated: "2024-11-05",
    status: "Archived",
    image: "/bsc-marksheet-template.png",
  },
];

const disputes = [
  {
    id: "DISP-001",
    certId: "CSE-1021",
    student: "Ananya Sharma",
    type: "Data Error (Name)",
    date: "2025-09-25",
    status: "Pending Registrar",
    priority: "High",
  },
  {
    id: "DISP-002",
    certId: "MECH-505",
    student: "Pritam Singh",
    type: "Missing Record",
    date: "2025-09-20",
    status: "Investigation",
    priority: "Medium",
  },
  {
    id: "DISP-003",
    certId: "MCOM-312",
    student: "Kajal Devi",
    type: "Marks Mismatch",
    date: "2025-09-15",
    status: "Resolved",
    priority: "Low",
  },
];

const keys = [
  {
    id: "KEY-001",
    name: "Primary Signing Key 2024",
    status: "Active",
    created: "2024-01-01",
    expiry: "2025-12-31",
    algorithm: "ECDSA-P256",
  },
  {
    id: "KEY-002",
    name: "Legacy Batch Key 2020-22",
    status: "Revoked",
    created: "2020-05-15",
    expiry: "2022-05-15",
    algorithm: "RSA-2048",
  },
];

const trustScoreHistory = [
  { month: "Jan", score: 85 },
  { month: "Feb", score: 86 },
  { month: "Mar", score: 89 },
  { month: "Apr", score: 91 },
  { month: "May", score: 92 },
  { month: "Jun", score: 90 },
  { month: "Jul", score: 92 },
  { month: "Aug", score: 93 },
  { month: "Sep", score: 92 },
];

const monthlyIssuance = [
  { name: "Jan", current: 1500, retroactive: 100 },
  { name: "Feb", current: 1650, retroactive: 50 },
  { name: "Mar", current: 1800, retroactive: 0 },
  { name: "Apr", current: 1400, retroactive: 20 },
  { name: "May", current: 1900, retroactive: 0 },
  { name: "Jun", current: 2100, retroactive: 80 },
  { name: "Jul", current: 1750, retroactive: 0 },
];

// ---------- Helpers ----------
const StatCard = ({ title, value, icon, description, color, badgeText }: any) => (
  <Card className="shadow-none">
    <CardContent className="p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className={`text-sm font-semibold ${color}`}>{title}</div>
        {badgeText && (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs shadow-none">
            {badgeText}
          </Badge>
        )}
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="text-4xl font-extrabold text-gray-900">{value}</div>
        <div className={`p-2 rounded-full ${color.replace("text-", "bg-")}/15`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
        {description}
      </p>
    </CardContent>
  </Card>
);

const NavButton = ({ children, icon, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-md transition-all duration-150 ${
      active
        ? "bg-blue-50 text-blue-700 font-semibold"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const getStatusBadge = (status: string) => {
  const map: Record<
    string,
    { text: string; className: string; icon: React.ReactNode }
  > = {
    "Pending Registrar": {
      text: "Pending",
      className: "bg-amber-100 text-amber-800 border-amber-300",
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    Investigation: {
      text: "Investigating",
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <Scan className="w-3 h-3 mr-1" />,
    },
    Resolved: {
      text: "Resolved",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
    Active: {
      text: "Active",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
    Revoked: {
      text: "Revoked",
      className: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
    Archived: {
      text: "Archived",
      className: "bg-gray-100 text-gray-800 border-gray-300",
      icon: <FileText className="w-3 h-3 mr-1" />,
    },
  };
  const result =
    map[status] || { text: status, className: "bg-gray-100 text-gray-700", icon: null };
  return (
    <Badge className={`border ${result.className}`}>
      {result.icon}
      {result.text}
    </Badge>
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: p.color }}>
            {p.name}: <span className="font-semibold">{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ---------- Page Component ----------
export default function InstitutionDashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState<
    "dashboard" | "template" | "bulk" | "keys" | "disputes" | "reputation"
  >("dashboard");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateStep, setTemplateStep] = useState(1);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTemplateFile(e.target.files[0]);
      setTemplateStep(2);
    }
  };

  const currentIssuanceRate = useMemo(() => {
    const lastMonth = monthlyIssuance[monthlyIssuance.length - 1];
    return lastMonth.current;
  }, []);

  const handleLogout = () => {
    console.log("Simulating log out and resetting dashboard state.");
    setActive("dashboard");
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 cursor-pointer" onClick={() => navigate("/")}>Registrar Portal</div>
            <div className="text-xs text-gray-500">
              Jharkhand State Skill Mission (JSSM)
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavButton
            active={active === "dashboard"}
            onClick={() => setActive("dashboard")}
            icon={<LayoutDashboard className="w-5 h-5" />}
          >
            Dashboard
          </NavButton>
          <NavButton
            active={active === "template"}
            onClick={() => setActive("template")}
            icon={<FileText className="w-5 h-5" />}
          >
            Templates
          </NavButton>
          <NavButton
            active={active === "bulk"}
            onClick={() => setActive("bulk")}
            icon={<Upload className="w-5 h-5" />}
          >
            Bulk Issuance
          </NavButton>
          <NavButton
            active={active === "keys"}
            onClick={() => setActive("keys")}
            icon={<KeyRound className="w-5 h-5" />}
          >
            Signing Keys
          </NavButton>
          <NavButton
            active={active === "disputes"}
            onClick={() => setActive("disputes")}
            icon={<MessageSquare className="w-5 h-5" />}
          >
            <span className="flex items-center gap-2">
              Disputes
              <Badge className="px-3 bg-red-500 text-white border-red-700 rounded-xl shadow-none">
                {disputes.filter((d) => d.status.includes("Pending")).length}
              </Badge>
            </span>
          </NavButton>
          <NavButton
            active={active === "reputation"}
            onClick={() => setActive("reputation")}
            icon={<BarChart4 className="w-5 h-5" />}
          >
            Reputation
          </NavButton>
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-red-300"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-auto">
        {/* header */}
        <header className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Console Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Status: Operational</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-800 font-medium px-3 py-1 flex items-center gap-1.5 border-emerald-300">
            <Zap className="w-4 h-4" /> System Status: {kpis.syncStatus}
          </Badge>
        </header>

        {/* --- 1. Dashboard (KPIs & Charts) --- */}
        {active==='dashboard' && (
          <>
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white">
              <StatCard 
                title="Certificates Issued" 
                value={kpis.issued.toLocaleString()} 
                description={`Last month: ${currentIssuanceRate} new issues`} 
                icon={<FileText className="w-5 h-5"/>} 
                color="text-blue-600"
              />
              <StatCard 
                title="Quota Remaining" 
                value={`${((kpis.quota - kpis.issued) / kpis.quota * 100).toFixed(1)}%`} 
                badgeText={`${(kpis.quota - kpis.issued).toLocaleString()} left`} 
                description={`Total quota: ${kpis.quota.toLocaleString()}`} 
                icon={<Gauge className="w-5 h-5"/>} 
                color="text-emerald-600"
              />
              <StatCard 
                title="Pending Disputes" 
                value={disputes.filter(d => d.status.includes('Pending')).length} 
                description={`Total disputes filed: ${kpis.disputes}`} 
                icon={<MessageSquare className="w-5 h-5"/>} 
                color="text-red-600"
              />
              <StatCard 
                title="Active Templates" 
                value={templates.filter(t => t.status === 'Active').length} 
                description={`${kpis.retroactive} legacy records onboarded`} 
                icon={<Settings className="w-5 h-5"/>} 
                color="text-amber-600"
              />
            </section>
            
            <section className="mt-6 grid lg:grid-cols-3 gap-6 h-[340px]">
                {/* No explicit border accent, relying on Card border and minimal shadow */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader><CardTitle>Monthly Certificate Issuance</CardTitle><CardDescription>Current vs. Retroactive Issuance Volume</CardDescription></CardHeader>
                    <CardContent className="h-[230px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyIssuance} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <ReTooltip content={<ChartTooltip />} /> 
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/> 
                                <Bar dataKey="current" stackId="a" fill="#3b82f6" name="Current Issuance" radius={[4, 4, 0, 0]}/>
                                <Bar dataKey="retroactive" stackId="a" fill="#f97316" name="Legacy Onboarding" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                {/* No explicit border accent, relying on Card border and minimal shadow */}
                <Card className="shadow-sm flex flex-col justify-between">
                    <CardHeader><CardTitle className="text-center">Institutional Trust Score</CardTitle><CardDescription className="text-center">Data Quality & Resolution Index</CardDescription></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center flex-grow">
                        <Gauge className="w-16 h-16 text-blue-500 mb-2"/>
                        <div className="text-6xl font-extrabold text-blue-600">{kpis.trustScore}</div>
                        <p className="text-sm text-gray-500 mt-2">Status: Excellent</p>
                        <Button variant="secondary" className="mt-4 w-full" onClick={() => setActive('reputation')}>
                            View Health Report <ChevronRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </CardContent>
                </Card>
            </section>
          </>
        )}

        {/* --- 2. Template Manager --- */}
        {active==='template' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600"><FileText className="w-6 h-6"/> Certificate Template Manager</h2>
            {/* No explicit border accent */}
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Template Creation & OCR Mapping</CardTitle><CardDescription>Define field locations for high-accuracy bulk processing.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {templateStep === 1 && (
                        <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <Upload className="w-8 h-8 text-blue-500"/>
                            <p className="font-medium text-lg">Upload a Sample Certificate Image</p>
                            <label className="cursor-pointer">
                                <Button as="span" variant="outline">
                                    <Plus className="w-4 h-4 mr-2"/> Select Sample File
                                </Button>
                                <Input type="file" className="hidden" onChange={handleTemplateUpload} />
                            </label>
                        </div>
                    )}
                    
                    {templateStep === 2 && (
                        <div className="space-y-4">
                            <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 text-center">
                                <h4 className="font-bold text-blue-700">Template Mapping: {templateFile?.name}</h4>
                                <div className="mt-3 w-full h-48 bg-gray-200 border border-gray-300 flex items-center justify-center relative rounded-md">
                                    <img 
                                        src="https://placehold.co/500x192/edf2f7/4a5568?text=Certificate+Template+Preview" 
                                        alt="Template Preview" 
                                        className="max-h-full max-w-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Define Name, Course, Date fields on the image.</p>
                            </div>
                            <Button className="w-full" onClick={() => setTemplateStep(3)}>Confirm Field Mapping (6 Fields)</Button>
                        </div>
                    )}

                    {templateStep === 3 && (
                        <div className="p-4 border border-emerald-500 rounded-lg bg-emerald-50 text-emerald-800 space-y-3 shadow-none">
                            <h4 className="font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Template Saved Successfully.</h4>
                            <p className="text-sm">Ready for use in Bulk Issuance.</p>
                            <Button variant="outline" className="text-emerald-800 border-emerald-500 bg-emerald-100 hover:bg-emerald-200 shadow-none" onClick={() => { setTemplateStep(1); setTemplateFile(null); }}>
                                <Plus className="w-4 h-4 mr-2"/> Add New Template
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader><CardTitle>Existing Templates</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Fields Defined</TableHead>
                                <TableHead>Last Update</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.name}</TableCell>
                                    <TableCell>{t.fields}</TableCell>
                                    <TableCell>{t.lastUpdated}</TableCell>
                                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0"><Edit className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-300 hover:bg-red-50" onClick={() => alert(`Archiving template ${t.name}`)}><Archive className="w-4 h-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </section>
        )}
        
        {/* --- 3. Bulk Issuance (Uses Templates) --- */}
        {active==='bulk' && (
             <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600"><Upload className="w-6 h-6"/> Bulk Certificate Issuance</h2>
                {/* No explicit border accent */}
                <Card className="shadow-sm">
                    <CardHeader><CardTitle>Upload Batch Records</CardTitle><CardDescription>Select a template, upload your CSV data, and process the batch.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Select Template</label>
                                <select className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm">
                                    {templates.filter(t => t.status === 'Active').map(t => <option key={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold">Issuance Type</label>
                                <select className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm">
                                    <option>Standard (Current Year)</option>
                                    <option className="text-amber-700">Retroactive (Legacy Records)</option>
                                </select>
                                <p className="text-xs text-amber-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Legacy records are flagged for audit.</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <FileText className="w-8 h-8 text-blue-500"/>
                            <p className="font-medium text-lg">Drag & Drop CSV File Here</p>
                            <Button variant="outline">Upload Data CSV</Button>
                        </div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="w-4 h-4 mr-2"/> Sign & Issue Batch
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader><CardTitle>Recent Batch History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Template Used</TableHead>
                                    <TableHead>Count</TableHead>
                                    <TableHead>Issuance Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">BATCH-01A</TableCell>
                                    <TableCell>B.Tech CSE Degree</TableCell>
                                    <TableCell>350</TableCell>
                                    <TableCell>Standard</TableCell>
                                    <TableCell>{getStatusBadge('Resolved')}</TableCell>
                                    <TableCell className="text-right"><Button size="sm" variant="outline" className="h-8 w-8 p-0"><Eye className="w-4 h-4"/></Button></TableCell>
                                </TableRow>
                                <TableRow className="bg-amber-50/50">
                                    <TableCell className="font-medium text-amber-700">BATCH-01B</TableCell>
                                    <TableCell>Legacy Marksheet</TableCell>
                                    <TableCell>1,500</TableCell>
                                    <TableCell className="text-amber-700 font-medium">Retroactive</TableCell>
                                    <TableCell>{getStatusBadge('Investigation')}</TableCell>
                                    <TableCell className="text-right"><Button size="sm" variant="outline" className="h-8 w-8 p-0"><Eye className="w-4 h-4"/></Button></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>
        )}

        {/* --- 4. Signing Keys & Security --- */}
        {active==='keys' && (
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600"><Shield className="w-6 h-6"/> Signing Key Management</h2>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* No explicit border accent */}
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle>Key Rotation & Revocation</CardTitle><CardDescription>Rotation is mandatory. Revocation is permanent.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm font-medium flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"/> 
                                **ALERT:** Key-001 expires in 98 days.
                            </div>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700">
                                <RotateCw className="w-4 h-4 mr-2"/> Initiate Key Rotation
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={() => alert('Initiating key revocation process')}>
                                <XCircle className="w-4 h-4 mr-2"/> Revoke Active Key
                            </Button>
                        </CardContent>
                    </Card>

                    {/* No explicit border accent */}
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle>Current Active Keys</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Key Name</TableHead>
                                        <TableHead>Algorithm</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {keys.map(k => (
                                        <TableRow key={k.id} className={k.status === 'Revoked' ? 'opacity-50' : ''}>
                                            <TableCell className="font-medium">{k.name}</TableCell>
                                            <TableCell>{k.algorithm}</TableCell>
                                            <TableCell>{k.expiry}</TableCell>
                                            <TableCell>{getStatusBadge(k.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </section>
        )}

        {/* --- 5. Dispute Console --- */}
        {active==='disputes' && (
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600"><MessageSquare className="w-6 h-6"/> Dispute Resolution Console</h2>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Open Disputes ({disputes.filter(d => d.status.includes('Pending')).length} Pending)</CardTitle>
                        <CardDescription>Review student-filed disputes.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dispute ID</TableHead>
                                    <TableHead>Cert ID</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date Filed</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputes.map(d => (
                                    <TableRow key={d.id} className={d.status.includes('Pending') ? 'bg-amber-50/70 hover:bg-amber-100/70 transition-colors' : ''}>
                                        <TableCell className="font-medium">{d.id}</TableCell>
                                        <TableCell>{d.certId}</TableCell>
                                        <TableCell>{d.student}</TableCell>
                                        <TableCell>{d.type}</TableCell>
                                        <TableCell>{d.date}</TableCell>
                                        <TableCell>{getStatusBadge(d.status)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {d.status.includes('Pending') ? (
                                                <>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3">Resolve</Button>
                                                    <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => alert(`Reviewing details for dispute ${d.id}`)}>Details</Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="outline" className="h-8 px-3">View Log</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>
        )}

        {/* --- 6. Reputation Dashboard --- */}
        {active==='reputation' && (
            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600"><BarChart4 className="w-6 h-6"/> Reputation & Health Dashboard</h2>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* No explicit border accent */}
                    <Card className="shadow-sm lg:col-span-1">
                        <CardHeader><CardTitle className="text-center">Current Trust Score</CardTitle><CardDescription className="text-center">Real-time rating based on data quality.</CardDescription></CardHeader>
                        <CardContent className="text-center py-4">
                            <div className="text-7xl font-extrabold text-emerald-600">{kpis.trustScore}</div>
                            <p className="font-semibold text-lg text-gray-700 mt-2">Score: Excellent</p>
                            <Progress value={kpis.trustScore} className="mt-4 h-3" color="#10b981"/>
                            <p className="text-xs text-gray-500 mt-1">Goal: Maintain above 90</p>
                        </CardContent>
                    </Card>

                    {/* No explicit border accent */}
                    <Card className="shadow-sm lg:col-span-2">
                        <CardHeader><CardTitle>Historical Trust Trend</CardTitle></CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trustScoreHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8"/>
                                    <YAxis domain={[80, 100]} stroke="#94a3b8"/>
                                    <ReTooltip content={<ChartTooltip />}/>
                                    <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#scoreColor)" name="Trust Score" strokeWidth={2}/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader><CardTitle>Health Remediation Tips</CardTitle><CardDescription>Actionable steps to improve your institutional health.</CardDescription></CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0"/>
                                <div><p className="font-semibold">Key Rotation Compliance: Healthy</p><p className="text-sm text-gray-600">Next rotation due in 98 days.</p></div>
                            </li>
                            <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-300">
                                <Clock className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0"/>
                                <div><p className="font-semibold text-amber-700">Dispute Response Time: Needs Improvement</p><p className="text-sm text-gray-600">Action: Prioritize the 2 high-priority disputes.</p></div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </section>
        )}
      </main>
    </div>
  );
}