/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Upload,
  Search,
  FileSpreadsheet,
  BarChart2,
  Code,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Download,
  UserCheck,
  Briefcase,
  TrendingUp,
  LogOut,
  FileText,
  MapPin,
  Users,
  Eye, // Used for Manual Review
  XCircle, // Used for Flag & Escalate
  Clock, // For Investigation
  PauseCircle, // For Suspend Issuance
  Clipboard, // For Copy Code
  Share2,
  Camera,
} from "lucide-react";

// --- SHADCN/UI & RECHARTS IMPORTS ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea for consistency
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
import VerificationResults from "../components/results/VerificationResult";

// ---------- Dummy data (jharkhand) ----------
const batchRows = [
  { id: "RAJ-001", name: "Aarav Sharma", university: "University of jharkhand", status: "verified", trust: 95, submittedOn: "2025-08-23", job: "Software Engineer" },
  { id: "RAJ-002", name: "Priya Meena", university: "IIT Jodhpur", status: "verified", trust: 92, submittedOn: "2025-08-21", job: "Data Analyst" },
  { id: "RAJ-003", name: "Rohit Singh", university: "Unknown Institute", status: "flagged", trust: 34, submittedOn: "2025-08-19", job: "Administrative Asst." },
  { id: "RAJ-004", name: "Simran Kaur", university: "BITS Pilani", status: "pending", trust: null, submittedOn: "2025-08-18", job: "Research Fellow" },
  { id: "RAJ-005", name: "Vikram Rathore", university: "NIT Jaipur", status: "verified", trust: 88, submittedOn: "2025-08-17", job: "Project Manager" }
];

const trustDistribution = [
  { name: "High (90-100)", value: 60, color: "#10b981" }, // Verified - Emerald 500
  { name: "Medium (70-89)", value: 28, color: "#f59e0b" }, // Pending Review - Amber 500
  { name: "Low (<70)", value: 12, color: "#ef4444" } // Flagged - Red 500
];

const flaggedTrend = [
  { month: "Apr", flagged: 4 },
  { month: "May", flagged: 7 },
  { month: "Jun", flagged: 3 },
  { month: "Jul", flagged: 9 },
  { month: "Aug", flagged: 12 }
];

const blacklisted = [
  { name: "Unknown Institute", flagged: 14, firstSeen: "2025-03-02", notes: "Multiple cloned certificates; IPs clustered in Jaipur", district: "Jaipur", unique_tag: "IP Cluster" },
  { name: "Fake College Jaipur", flagged: 9, firstSeen: "2025-05-10", notes: "Uses generic template; suspicious signer", district: "Jaipur", unique_tag: "Template Fraud" },
  { name: "Unregistered Coaching Udaipur", flagged: 5, firstSeen: "2025-07-01", notes: "Repeated low-trust scores and marks mismatches", district: "Udaipur", unique_tag: "Low Score History" }
];

// ---------- Helpers ----------
const colorMap: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  flagged: "bg-red-100 text-red-700"
};

const getProgressBarColor = (trust: number) => {
  if (trust >= 90) return "bg-emerald-500";
  if (trust >= 70) return "bg-amber-500";
  return "bg-red-500";
};

// Custom Code Block component (for Integration)
const CodeBlock = ({ children }: any) => {
  const [copied, setCopied] = useState(false);
  const codeText = children;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap border border-dashed text-primary/80 overflow-auto">
        {codeText}
      </pre>
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2 p-2 h-auto"
        onClick={handleCopy}
      >
        {copied ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
            <Clipboard className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

// NEW Helper component for itemized verification display (similar to student portal image)
const VerificationItem = ({ label, value, score, status }: any) => {
    const statusColor = score >= 90 ? 'bg-emerald-100 text-emerald-700' : score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
    return (
        <div className="flex justify-between items-start py-2 border-b last:border-b-0">
            <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="font-semibold">{value}</div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <Badge className={`font-semibold text-xs ${statusColor}`}>
                    {score}% {status.toUpperCase()}
                </Badge>
            </div>
        </div>
    );
};


// ---------- Page Component ----------
export default function VerifierAllInOneEnhanced() {
  const navigate = useNavigate();
  // Consolidated 'analytics' into 'dashboard', renaming 'evidence' to 'forensic'
  const [active, setActive] = useState<"dashboard"|"quick"|"batch"|"forensic"|"blacklist"|"integration">("dashboard"); 
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedRow, setSelectedRow] = useState<any>(batchRows[2]);

  // Add uploadMode state for Quick Verify
  const [uploadMode, setUploadMode] = useState<"file" | "qr">("file");

  // Add missing states for uploading and extractedFields
  const [uploading, setUploading] = useState(false);
  const [extractedFields, setExtractedFields] = useState<any[]>([]);

  // Modals
  const [attachOpen, setAttachOpen] = useState(false);
  const [investigateOpen, setInvestigateOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [candidateId, setCandidateId] = useState("");

  const filteredRows = useMemo(() => {
    if (!query) return batchRows;
    return batchRows.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase()) || r.university.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleUploadSelect = (f?: File) => {
    if (!f) return;
    setFile(f);
  };

  function fakeVerify() {
    setIsVerifying(true);
    setResult(null);
    setTimeout(() => {
      // Data based on the uploaded image (image_ade48d.png)
      const trust = 54;
      const status = 'flagged';
      
      // Refactored result object to hold itemized breakdown (like the student portal image)
      setResult({ 
          trust, 
          status, 
          tx: 'RAJ'+Math.random().toString(36).slice(2,9).toUpperCase(), 
          name: { value: 'Rahul Kumar', score: 54, status: 'Flagged' },
          roll: { value: 'JH2021-0456', score: 93, status: 'Verified' },
          course: { value: 'B.Tech - Computer Science', score: 96, status: 'Verified' },
          marks: { value: '78%', score: 80, status: 'Review' },
          certId: { value: 'CERT-XYZ-1234', score: 47, status: 'Flagged' }
      });
      setIsVerifying(false);
    }, 1400);
  }

  // --- UI Helpers (Inline for scope) ---
  const NavButton = ({ children, icon, onClick, active }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted/50'}`}>
      {icon}
      <span>{children}</span>
    </button>
  );

  const Stat = ({ title, value, icon }: any) => (
    <Card className="shadow-lg border-t-4 border-primary/50">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div>{icon}</div>
      </CardContent>
    </Card>
  );

  // UPDATED: EvidenceRow to remove indicatorColor and use className
  const EvidenceRow = ({ label, value }: any) => (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <Progress value={value} className={`w-28 h-2 ${getProgressBarColor(value)}`} />
        <div className="text-sm font-bold w-10 text-right text-primary">{value}%</div>
      </div>
    </div>
  );
  
  const ThresholdRule = ({ icon: Icon, title, description, color, border }: any) => (
    <div className={`flex items-start p-3 rounded-lg border-l-4 ${border} bg-white shadow-sm`}>
      <Icon className={`w-5 h-5 mt-1 mr-3 ${color}`} />
      <div>
        <div className={`font-bold text-sm ${color}`}>{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
    </div>
  );

  function onFileSelected(f: File) {
    setUploading(true);
    setExtractedFields([]); // Reset
    // Simulate OCR processing
    setTimeout(() => {
      setExtractedFields([
        { field: 'Name', value: 'Rahul Kumar', confidence: 95 },
        { field: 'Roll No', value: 'JH2021-0456', confidence: 98 },
        { field: 'Course', value: 'B.Tech Computer Science', confidence: 97 },
        { field: 'Marks', value: '78%', confidence: 85 },
        { field: 'Certificate ID', value: 'CERT-XYZ-1234', confidence: 92 }
      ]);
      setUploading(false);
    }, 2000); // Simulate 2 second processing
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-primary">Verifier Portal</div>
            <div className="text-xs text-muted-foreground">Jhar-Praman Digital (JPD)</div>
          </div>
        </div>

        <nav className="flex-1">
          <NavButton active={active==='dashboard'} onClick={() => setActive('dashboard')} icon={<LayoutDashboard className="w-5 h-5"/>}>Dashboard</NavButton>
          <NavButton active={active==='quick'} onClick={() => setActive('quick')} icon={<Upload className="w-5 h-5"/>}>Quick Verify</NavButton>
          <NavButton active={active==='batch'} onClick={() => setActive('batch')} icon={<FileSpreadsheet className="w-5 h-5"/>}>Batch Verification</NavButton>
          {/* Renamed to Forensic View */}
          <NavButton active={active==='forensic'} onClick={() => setActive('forensic')} icon={<BarChart2 className="w-5 h-5"/>}>Forensic View</NavButton>
          {/* <NavButton active={active==='blacklist'} onClick={() => setActive('blacklist')} icon={<AlertTriangle className="w-5 h-5"/>}>Blacklist</NavButton> */}
          <NavButton active={active==='integration'} onClick={() => setActive('integration')} icon={<Code className="w-5 h-5"/>}>Integration</NavButton>
        </nav>

        <div className="mt-6 border-t pt-4">
          <Button variant="outline" className="w-full mb-2" onClick={() => navigate('/')}> <LogOut className="w-4 h-4 mr-2"/> Logout</Button>
          <Button className="w-full" variant="secondary" onClick={() => alert('Open account settings (demo)')}>Settings</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-auto">
        <header className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-extrabold text-primary/80">Verifier Dashboard</h1>
            <p className="text-sm text-muted-foreground">High-speed verification, legal evidence, and fraud intelligence.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Agency Status</div>
              <div className="font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600"/> Jharkhand Govt.
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Tiles + Analytics (Consolidated) */}
        {active==='dashboard' && (
          <>
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Stat title="Verified Today" value="134" icon={<CheckCircle className="w-6 h-6 text-emerald-600"/>} />
              <Stat title="Flagged Cases" value="12" icon={<AlertTriangle className="w-6 h-6 text-red-600"/>} />
              <Stat title="Avg Trust Score" value="91%" icon={<Shield className="w-6 h-6 text-primary"/>} />
              <Stat title="Batch Jobs Active" value="3" icon={<FileSpreadsheet className="w-6 h-6 text-amber-600"/>} />
            </section>
            
            <section className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Real-Time Analytics</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle>Trust Score Distribution</CardTitle></CardHeader>
                        <CardContent className="h-80 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={trustDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={4} fill="#8884d8">
                                        {trustDistribution.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                                    </Pie>
                                    <ReTooltip formatter={(value: number, name: string) => [`${value} cases`, name]}/>
                                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader><CardTitle>Flagged Cases Trend</CardTitle></CardHeader>
                        <CardContent className="h-80 pt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <RBarChart data={flaggedTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <ReTooltip />
                                    <Bar dataKey="flagged" fill="#ef4444" radius={[4, 4, 0, 0]} name="Flagged Cases" />
                                </RBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </section>
          </>
        )}

        {/* Quick Verify (Segmented UI) */}
        {active==='quick' && (
          <section className="grid md:grid-cols-3 gap-6">
            
            {/* Verification Methods */}
            <Card className="shadow-lg md:col-span-2">
              <CardHeader><CardTitle>Certificate Verification</CardTitle></CardHeader>
              <CardContent>
                {/* Upload */}
        <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Verify Certificate</h2>
              <div className="text-sm text-muted-foreground">Choose verification method</div>
            </div>

            {/* Toggle for File Upload / QR Scan */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card
                className={`cursor-pointer border-2 ${
                  uploadMode === "file" ? "border-primary shadow-lg" : "border-border hover:bg-muted/10"
                }`}
                onClick={() => setUploadMode("file")}
              >
                <CardContent className="p-6 text-center">
                  <Upload className="mx-auto w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">File Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload PDF, JPG, or PNG certificates
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 ${
                  uploadMode === "qr" ? "border-primary shadow-lg" : "border-border hover:bg-muted/10"
                }`}
                onClick={() => setUploadMode("qr")}
              >
                <CardContent className="p-6 text-center">
                  <QrCode className="mx-auto w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">QR Code Scan</h3>
                  <p className="text-sm text-muted-foreground">
                    Scan certificate QR using camera
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* File Upload Panel */}
            {uploadMode === "file" && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div
                    className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() =>
                      document.getElementById("hidden-file-input")?.click()
                    }
                  >
                    <Upload className="mx-auto w-10 h-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag & drop or click to upload certificate
                    </p>
                    <input
                      id="hidden-file-input"
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files && e.target.files[0];
                        if (f) onFileSelected(f);
                      }}
                    />
                  </div>

                  {/* Show OCR Progress if processing */}
                  {uploading || extractedFields.length > 0 ? (
                    <VerificationResults></VerificationResults>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* QR Scan Panel */}
            {uploadMode === "qr" && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-full h-64 bg-black/5 rounded-lg flex items-center justify-center border border-dashed">
                    <span className="text-base text-muted-foreground">
                      [Camera Feed Placeholder for QR Scanning]
                    </span>
                  </div>
                  <Button className="mt-4">
                    <Camera className="w-4 h-4 mr-2" /> Start Scan
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Scanning initiates instant database lookup via embedded QR link.</p>
                </CardContent>
              </Card>
            )}
        </>
              </CardContent>
            </Card>

            {/* Thresholds & Employer Workflow (Dynamically Visible) */}
            <div className="md:col-span-1 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader><CardTitle className="text-primary">Thresholds & Action Rules</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <ThresholdRule 
                            icon={CheckCircle}
                            title="Auto-Approve"
                            description="Trust Score ≥ 90%. Automatic pass for HR systems."
                            color="text-emerald-600"
                            border="border-emerald-500"
                        />
                         <ThresholdRule 
                            icon={Eye}
                            title="Manual Review"
                            description="70% ≤ Trust ≤ 89%. Requires Supervisor Sign-off."
                            color="text-amber-600"
                            border="border-amber-500"
                        />
                         <ThresholdRule 
                            icon={XCircle}
                            title="Flag & Escalate"
                            description="Trust Score ≤ 69%. Must be moved to Investigation Queue."
                            color="text-red-600"
                            border="border-red-500"
                        />
                    </CardContent>
                </Card>

                {/* Employer Workflow is only visible after verification is complete (result != null) */}
                {result && (
                    <Card className="shadow-lg border-t-2 border-dashed border-primary/50 transition-all duration-300">
                        <CardHeader><CardTitle>Employer Workflow</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">Attach verified evidence to your internal HR candidate profiles.</div>
                                <div className="flex gap-2">
                                    <Input placeholder="Candidate ID / Email" value={candidateId} onChange={(e)=> setCandidateId(e.target.value)} />
                                    <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={()=> { if(result) setAttachOpen(true)}}><UserCheck className="w-4 h-4 mr-2"/>Attach</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Attach Evidence to Candidate</DialogTitle></DialogHeader>
                                            <p className="text-sm">Confirm link of verification <b>{result?.tx}</b> to candidate <b>{candidateId || '—'}</b>.</p>
                                            <Button onClick={()=> { setAttachOpen(false); alert('Evidence successfully attached to candidate profile (demo)!'); }}>Confirm Link</Button>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
          </section>
        )}

        {/* Forensic View (Enhanced Legal/Forensic) */}
        {active==='forensic' && (
          <section className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-xl">
              <CardHeader className="bg-muted/10 border-b">
                <CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5"/> Forensic View & Audit Trail</CardTitle>
                <CardDescription>Legal audit trail for <b>{selectedRow?.name ?? 'Candidate'}</b> ({selectedRow?.id ?? '—'}).</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  
                  {/* Trust Score Breakdown - UPDATED LAYOUT */}
                  <div className="p-4 rounded-lg border bg-background/50">
                    <h4 className="font-bold text-lg mb-3 text-primary">Trust Score Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <EvidenceRow label="OCR Confidence" value={92} />
                        <EvidenceRow label="Blockchain Hash Match" value={88} />
                        <EvidenceRow label="Template Match Score" value={selectedRow?.trust ?? 34} />
                        <EvidenceRow label="Signature Validity Check" value={94} />
                    </div>
                  </div>

                  {/* Forensic Anomaly Report */}
                  <div className="p-4 rounded-lg border-2 border-red-400 bg-red-50/50">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-red-700"><AlertTriangle className="w-5 h-5"/> Forensic Anomaly Report</h4>
                    <div className="text-sm font-medium text-red-600">Key Issues:</div>
                    <ul className="text-sm list-disc ml-5 mt-2 space-y-1 text-red-600">
                      <li>Marks Mismatch: University DB record differs from scanned document (45% confidence).</li>
                      <li><b>Pixel Inconsistency:</b> Manipulation pattern detected around date/signature fields.</li>
                      <li><b>Template Version:</b> Certificate template is outdated or unofficial.</li>
                    </ul>
                  </div>
                  
                  {/* Legal Lightbox */}
                  <div className="p-4 rounded-lg border bg-muted/20 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">Legal Lightbox Package</h4>
                      <p className="text-sm text-muted-foreground">Download the cryptographically sealed evidence bundle for litigation/audit purposes.</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline"><FileText className="w-4 h-4 mr-2"/>Open Lightbox</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Legal Evidence Package</DialogTitle></DialogHeader>
                          <p className="text-sm">This package contains all evidence artifacts (signed OCR, consensus logs, forensic overlays). <b>Use only for legal audits.</b></p>
                          <Button onClick={()=> alert('Downloading certified legal bundle (demo)')}><Download className="w-4 h-4 mr-2"/>Download Certified Bundle</Button>
                        </DialogContent>
                      </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Case Management</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">Current Verdict: <Badge className={`font-semibold ${colorMap[selectedRow?.status]}`}>{selectedRow?.status.toUpperCase()}</Badge></div>
                  
                  <div className="flex flex-col gap-2">
                    <Button className="w-full bg-red-600 hover:bg-red-700" onClick={()=> alert('Moved to Investigation Queue (demo)')}>Raise Formal Incident</Button>
                    <Button variant="secondary" className="w-full" onClick={()=> alert('Notifying issuing University Registrar (demo)')}>Notify Issuer</Button>
                    <Button variant="outline" className="w-full" onClick={()=> alert('Marked as Manual Review Complete (demo)')}>Close Case</Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Internal Notes</h5>
                    <Textarea rows={3} className="w-full p-2 border rounded-md text-sm" placeholder="Add case notes for auditor..."></Textarea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Batch Verification (Remains unchanged from last update, but included for completeness) */}
        {active==='batch' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Batch Verification Jobs (5 Candidates)</h2>
              <div className="flex items-center gap-2">
                <Input placeholder="Search name or ID..." className="w-64" onChange={(e)=> setQuery(e.target.value)} />
                <Button variant="outline" onClick={()=> alert('Open CSV mapping wizard (demo)')}><FileText className="w-4 h-4 mr-2"/>Map CSV Schema</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={()=> alert('Upload new Batch CSV (demo)')}><FileSpreadsheet className="w-4 h-4 mr-2"/>Start New Job</Button>
              </div>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[60vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="w-[200px]">Candidate & Job</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead className="w-[150px]">Trust Score</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right w-[250px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map(row => (
                        <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="font-bold">{row.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Briefcase className="w-3 h-3"/> {row.job}
                            </div>
                          </TableCell>
                          <TableCell>{row.university}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{row.submittedOn}</TableCell>
                          <TableCell>
                            {row.trust ? (
                              <div className="flex items-center gap-2">
                                {/* The color class is now implicitly handled by the Progress component or its className */}
                                <div className="text-sm font-bold w-10 text-right">{row.trust}%</div>
                              </div>
                            ) : (<div className="text-sm text-muted-foreground">Processing...</div>)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`font-semibold ${colorMap[row.status]}`}>{row.status.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={()=> { setSelectedRow(row); setActive('forensic'); window.scrollTo({top:0, behavior:'smooth'}) }}>View Evidence</Button>
                              <Button size="sm" variant="ghost" onClick={()=> alert('Download evidence package (demo)')}><Download className="w-4 h-4"/></Button>
                              <Button size="sm" className=" text-white hover:bg-secondary/80" onClick={()=> { setSelectedRow(row); setAttachOpen(true); setCandidateId(row.id); }}>Attach</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-4 border-t flex justify-between items-center bg-muted/20">
                    <div className="text-sm text-muted-foreground">Showing {filteredRows.length} results of 5 total in batch.</div>
                    <Button variant="secondary" onClick={()=> alert('Export full batch report CSV (demo)')}><Download className="w-4 h-4 mr-2"/>Export Full Report</Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
        
        {/* Blacklist (Visual refresh + Investigation/Suspension flow) */}
        {active==='blacklist' && (
          <section>
            <h2 className="text-xl font-bold mb-4">Blacklisted Entities & Fraud Intelligence</h2>
            <p className="text-sm text-muted-foreground mb-6">Institutions or entities consistently associated with low trust scores, template fraud, or confirmed manipulation attempts.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {blacklisted.map((b, i) => (
                // UPDATED: Styling to be Amber/Orange for a 'Warning' feel, instead of harsh Red
                <Card key={i} className="bg-amber-50 border-2 border-amber-300 shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-amber-800">{b.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-amber-700"/> {b.district} • First seen: {b.firstSeen}
                        </div>
                        
                        <Badge variant="default" className="bg-amber-400 hover:bg-amber-400 text-black font-semibold mb-2">{b.unique_tag}</Badge>

                        <div className="mt-2 text-sm text-amber-700 font-medium">{b.notes}</div>
                        
                        <div className="flex items-center gap-1 mt-3">
                          <Users className="w-4 h-4 text-amber-700"/>
                          <div className="text-sm font-bold text-amber-700">{b.flagged} linked fraud cases</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200 flex flex-col gap-2">
                      
                      {/* Investigate Dialog Trigger */}
                      <Dialog open={investigateOpen && selectedRow.name === b.name} onOpenChange={setInvestigateOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-amber-400 text-amber-700 hover:bg-amber-100" 
                            onClick={()=> {setSelectedRow(b); setInvestigateOpen(true);}}
                          >
                            <Clock className="w-4 h-4 mr-2"/>Investigate Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-700"><Clock className="w-5 h-5"/> Initiate Formal Investigation</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground">Confirm scheduling a Level 3 forensic audit for <b>{selectedRow?.name}</b>.</p>
                          <div className="space-y-3">
                            <Input placeholder="Investigation Lead/Team Name" />
                            <Input placeholder="Expected Completion Date (DD/MM/YYYY)" />
                            <Textarea rows={3} placeholder="Investigation Scope & Rationale (Mandatory)"></Textarea>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={()=> setInvestigateOpen(false)}>Cancel</Button>
                            <Button className="bg-amber-600 hover:bg-amber-700" onClick={()=> { setInvestigateOpen(false); alert(`Investigation initiated for ${selectedRow?.name}!`); }}>Confirm & Schedule</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Suspend Dialog Trigger */}
                      <Dialog open={suspendOpen && selectedRow.name === b.name} onOpenChange={setSuspendOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="w-full bg-red-600 hover:bg-red-700" 
                            onClick={()=> {setSelectedRow(b); setSuspendOpen(true);}}
                          >
                            <PauseCircle className="w-4 h-4 mr-2"/>Suspend Issuance
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-700"><PauseCircle className="w-5 h-5"/> Suspend Issuance Policy</DialogTitle></DialogHeader>
                          <p className="text-sm text-red-500 font-bold">WARNING: This action immediately suspends all new verification requests for <b>{selectedRow?.name}</b>.</p>
                          <div className="space-y-3">
                            <Input placeholder="Supervisor Sign-off ID" />
                            <Textarea rows={3} placeholder="Justification for Suspension (Mandatory)"></Textarea>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={()=> setSuspendOpen(false)}>Cancel</Button>
                            <Button className="bg-red-600 hover:bg-red-700" onClick={()=> { setSuspendOpen(false); alert(`Issuance suspended for ${selectedRow?.name}!`); }}>Confirm Suspension</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Integration (UI Refresh) */}
        {active==='integration' && (
          <section>
            <h2 className="text-xl font-bold mb-4">Integration & API Management</h2>
            <p className="text-sm text-muted-foreground mb-6">Connect the portal to your HR systems via APIs and embeddable widgets for seamless, automated verification workflow.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary"/> Embeddable HR Widget</CardTitle></CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">Drop this simple HTML/JS code into your HR/ATS portal for quick, in-app verification without redirecting users.</CardDescription>
                  
                  {/* Custom Code Block Component */}
                  <CodeBlock>
{`<script src="https://jharkhand-gov.verifynow/widget.js"></script>
<div id="jharkhand-verifier" data-api-key="YOUR_LIVE_KEY"></div>`}
                  </CodeBlock>

                  <div className="mt-6 pt-4 border-t">
                    <h5 className="font-bold mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-primary"/> Key Features</h5>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 text-emerald-500 flex-shrink-0"/>
                        <div><b>Real-time Status:</b> Get instant success/flag status updates directly in your system.</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 text-emerald-500 flex-shrink-0"/>
                        <div><b>Configurable Trust Thresholds</b> for auto-flagging based on your company's risk profile.</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 text-emerald-500 flex-shrink-0"/>
                        <div><b>Custom Branding</b> options to match your internal look and feel.</div>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary"/> API & Webhook Management</CardTitle></CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">Manage access keys for different teams and configure endpoints for automated, back-end result delivery.</CardDescription>
                  
                  <h5 className="font-bold text-sm mb-2">Technical Capabilities</h5>
                  <ul className="text-sm list-disc ml-5 space-y-1 text-muted-foreground mb-6">
                      <li><b>REST APIs</b> for bulk requests and detailed status checks.</li>
                      <li><b>Webhook</b> system for guaranteed real-time notification on job completion.</li>
                  </ul>

                  <div className="mt-3 flex flex-col gap-2">
                    <Button variant="secondary" className="w-full">Create New API Key</Button>
                    <Button variant="outline" className="w-full" onClick={()=> alert('Open webhook configuration panel (demo)')}>Configure Webhook Endpoint</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}