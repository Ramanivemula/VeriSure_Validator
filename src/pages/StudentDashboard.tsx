/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/StudentDashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Upload,
  Eye,
  History,
  Wallet,
  QrCode,
  FileCheck,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  MessageSquare,
  Download,
  Share2,
  Camera,
  Search,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import heroImage from "@/assets/hero-verification.jpg"; // optional, used in forensic preview placeholder
import VerificationResults from "@/components/results/VerificationResult";

// ---------- Mock / helper types ----------
type FieldExtract = {
  label: string;
  value: string;
  confidence: number;
  status: "ok" | "warn" | "fail";
};

type CertRecord = {
  id: string;
  title: string;
  institution: string;
  date: string;
  status: "verified" | "pending" | "flagged";
  score?: number | null;
  hash?: string | null;
};

type Dispute = {
  id: string;
  certId: string;
  reason: string;
  status: "pending" | "under_review" | "resolved";
  createdAt: string;
};

// ---------- Dummy dataset ----------
const initialHistory: CertRecord[] = [
  {
    id: "CERT-001",
    title: "B.Tech - Computer Science",
    institution: "IIT Dhanbad",
    date: "2024-01-15",
    status: "verified",
    score: 98,
    hash: "0xabc123...4f",
  },
  {
    id: "CERT-002",
    title: "Higher Secondary Certificate",
    institution: "Jharkhand Academic Council",
    date: "2024-01-10",
    status: "pending",
    score: null,
    hash: null,
  },
  {
    id: "CERT-003",
    title: "Class 10 Board Certificate",
    institution: "JAC Board",
    date: "2024-01-08",
    status: "flagged",
    score: 45,
    hash: "0xf00df00d...9a",
  },
];

const demoFieldsTemplate = [
  { label: "Name", value: "Rahul Kumar" },
  { label: "Roll No", value: "JH2021-0456" },
  { label: "Course", value: "B.Tech - Computer Science" },
  { label: "Marks", value: "78%" },
  { label: "Certificate ID", value: "CERT-XYZ-1234" },
];

// ---------- Page Component ----------
export default function StudentAllInOne() {
  const navigate = useNavigate();

  // navigation state (sidebar)
  const [active, setActive] = useState<
    | "dashboard"
    | "upload"
    | "results"
    | "history"
    | "wallet"
    | "tools"
    | "disputes"
  >("dashboard");

  // Stats + history
  const [history, setHistory] = useState<CertRecord[]>(initialHistory);
  const stats = useMemo(() => {
    const total = history.length;
    const verified = history.filter((h) => h.status === "verified").length;
    const pending = history.filter((h) => h.status === "pending").length;
    const flagged = history.filter((h) => h.status === "flagged").length;
    const trustScore = Math.round((verified / Math.max(1, total)) * 100);
    return { total, verified, pending, flagged, trustScore };
  }, [history]);

  // upload / progressive OCR
  const [uploadMode, setUploadMode] = useState<"file" | "qr">("file"); // ADDED STATE
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<FieldExtract[]>([]);
  const [progress, setProgress] = useState(0);
  const [mockCertId, setMockCertId] = useState<string | null>(null);
  const uploadTimerRef = useRef<number | null>(null);

  // verification results view
  const [selectedCert, setSelectedCert] = useState<CertRecord | null>(null);
  const [consensus, setConsensus] = useState({
    digilocker: true,
    universityDb: Math.random() > 0.35,
    blockchain: Math.random() > 0.15,
    forensic: Math.random() > 0.2,
  });

  // forensic visualizer slider
  const [forensicOpen, setForensicOpen] = useState(false);
  const [overlayWidth, setOverlayWidth] = useState(50); // percent slider

  // wallet
  const [wallet] = useState<CertRecord[]>(
    history.filter((h) => h.status === "verified")
  );

  // disputes
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: "D-001",
      certId: "CERT-003",
      reason: "Marks mismatch reported compared to university DB",
      status: "under_review",
      createdAt: "2024-01-09",
    },
  ]);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeCertId, setDisputeCertId] = useState<string | null>(null);

  // quick tools
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<CertRecord | null>(null);

  // charts data
  const lineData = [
    { date: "Jan", verified: 3, pending: 1, flagged: 1 },
    { date: "Feb", verified: 2, pending: 1, flagged: 0 },
    { date: "Mar", verified: 3, pending: 0, flagged: 0 },
    { date: "Apr", verified: 1, pending: 1, flagged: 0 },
  ];
  const pieData = [
    { name: "Verified", value: Math.max(1, stats.verified), color: "#16a34a" },
    { name: "Pending", value: Math.max(0, stats.pending), color: "#f59e0b" },
    { name: "Flagged", value: Math.max(0, stats.flagged), color: "#ef4444" },
  ];

  // --- NEW: Helper for Badge Color (reused from VerifierDashboard logic) ---
  const getStatusColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-amber-50 text-amber-700'; // Default for pending/null
    if (score >= 90) return 'bg-emerald-50 text-emerald-700';
    if (score >= 70) return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  };
  
  // --- NEW: Mock data for the detailed itemized result (as per image) ---
  const mockVerificationResult = {
    trust: 54,
    status: 'flagged',
    tx: 'CERT-TX-789ABC',
    breakdown: {
        name: { value: 'Rahul Kumar', score: 54, status: 'Flagged' },
        roll: { value: 'JH2021-0456', score: 93, status: 'Verified' },
        course: { value: 'B.Tech - Computer Science', score: 96, status: 'Verified' },
        marks: { value: 78, score: 80, status: 'Review' },
        certId: { value: 'CERT-XYZ-1234', score: 47, status: 'Flagged' }
    }
  };


  // ---------- Mock upload handler ----------
  const onFileSelected = (file?: File) => {
    if (!file) return;
    setUploading(true);
    setUploadedFileName(file.name);
    setExtractedFields([]);
    setProgress(0);
    setMockCertId(null);

    // simulate progressive extraction
    let idx = 0;
    uploadTimerRef.current && window.clearInterval(uploadTimerRef.current);
    uploadTimerRef.current = window.setInterval(() => {
      // push next field
      if (idx < demoFieldsTemplate.length) {
        // simulate confidence & status
        const rand = Math.random();
        let status: FieldExtract["status"] = "ok";
        if (rand < 0.12) status = "fail";
        else if (rand < 0.36) status = "warn";
        const confidence =
          status === "ok"
            ? 92 + Math.round(Math.random() * 6)
            : status === "warn"
            ? 70 + Math.round(Math.random() * 15)
            : 45 + Math.round(Math.random() * 10);
        const fld = {
          label: demoFieldsTemplate[idx].label,
          value: demoFieldsTemplate[idx].value,
          confidence,
          status,
        };
        setExtractedFields((s) => [...s, fld]);
        idx++;
        setProgress(Math.round((idx / demoFieldsTemplate.length) * 100));
      } else {
        // finish
        uploadTimerRef.current && window.clearInterval(uploadTimerRef.current);
        setUploading(false);

        // simulate result record addition
        const newCert: CertRecord = {
          id: `CERT-${Math.floor(Math.random() * 9000) + 100}`,
          title: demoFieldsTemplate[2].value,
          institution: "Mock University",
          date: new Date().toISOString().slice(0, 10),
          status: Math.random() > 0.2 ? "verified" : "pending",
          score: Math.random() > 0.2 ? 85 + Math.floor(Math.random() * 15) : null,
          hash: Math.random() > 0.2 ? "0x" + Math.random().toString(16).slice(2, 12) : null,
        };
        setHistory((h) => [newCert, ...h]);
        setMockCertId(newCert.id);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current);
      }
    };
  }, []);

  // ---------- Handlers ----------
  const openDetails = (cert: CertRecord) => {
    setSelectedCert(cert);
    // randomize consensus for demo
    setConsensus({
      digilocker: Math.random() > 0.1,
      universityDb: Math.random() > 0.4,
      blockchain: Boolean(cert.hash),
      forensic: Math.random() > 0.5,
    });
    setActive("results");
  };

  const handleLookup = () => {
    const found = history.find((h) => h.id.toLowerCase() === lookupId.toLowerCase());
    if (found) setLookupResult(found);
    else {
      setLookupResult(null);
      // simulate not found
      setTimeout(() => {
        setLookupResult({
          id: "NOT-FOUND",
          title: "No record found",
          institution: "",
          date: "",
          status: "pending",
          score: null,
        } as any);
      }, 500);
    }
  };

  const raiseDispute = (certId?: string) => {
    const id = certId ?? disputeCertId;
    if (!id) return alert("Select certificate to dispute");
    const newDisp: Dispute = {
      id: "D-" + Math.floor(Math.random() * 9000 + 100),
      certId: id,
      reason: disputeReason || "Student raised dispute via UI",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setDisputes((d) => [newDisp, ...d]);
    setShowDisputeModal(false);
    setDisputeReason("");
    setDisputeCertId(null);
    alert("Dispute submitted (demo). Institutional registrar will be notified.");
  };

  // forensic slider handler
  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverlayWidth(Number(e.target.value));
  };

  // download evidence (mock)
  const downloadEvidence = (cert: CertRecord) => {
    alert(`Downloading evidence package for ${cert.id} (mock)`);
  };

  const shareCert = (cert: CertRecord) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/verify/${cert.id}`)
      .then(() => alert("Share link copied to clipboard (mock)"));
  };

  // ---------- Render ----------
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold">Student Portal</div>
            <div className="text-xs text-muted-foreground">Certificate Hub</div>
          </div>
        </div>

        <nav className="flex-1">
          <SideButton active={active === "dashboard"} onClick={() => setActive("dashboard")} icon={<Shield className="w-5 h-5" />}>
            Dashboard
          </SideButton>
          <SideButton active={active === "upload"} onClick={() => setActive("upload")} icon={<Upload className="w-5 h-5" />}>
            Upload Certificate
          </SideButton>
          <SideButton active={active === "results"} onClick={() => setActive("results")} icon={<Eye className="w-5 h-5" />}>
            Verification Results
          </SideButton>
          <SideButton active={active === "history"} onClick={() => setActive("history")} icon={<History className="w-5 h-5" />}>
            History
          </SideButton>
          <SideButton active={active === "wallet"} onClick={() => setActive("wallet")} icon={<Wallet className="w-5 h-5" />}>
            Academic Wallet
          </SideButton>
          {/* <SideButton active={active === "tools"} onClick={() => setActive("tools")} icon={<QrCode className="w-5 h-5" />}>
            Quick Tools
          </SideButton> */}
          <SideButton active={active === "disputes"} onClick={() => setActive("disputes")} icon={<MessageSquare className="w-5 h-5" />}>
            Dispute Resolution
          </SideButton>
        </nav>

        <div className="mt-4">
          <Button variant="outline" className="w-full mb-2" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button className="w-full" onClick={() => alert("Profile settings (demo)")}>
            Profile Settings
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Dashboard */}
        {active === "dashboard" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <div className="flex items-center gap-4">
                <Badge className="bg-primary/10 text-primary border">Trust Score: {stats.trustScore}%</Badge>
                <Badge className="bg-muted/10">Time Saved: 3 weeks</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Certificates" value={stats.total} icon={<FileCheck className="w-6 h-6 text-primary" />} />
              <StatCard title="Verified" value={stats.verified} icon={<CheckCircle className="w-6 h-6 text-success" />} />
              <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-6 h-6 text-warning" />} />
              <StatCard title="Flagged" value={stats.flagged} icon={<AlertTriangle className="w-6 h-6 text-destructive" />} />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Breakdown</CardTitle>
                  <CardDescription>Quick snapshot of statuses</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Timeline</CardTitle>
                  <CardDescription>Monthly activity</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="verified" stroke="#16a34a" />
                      <Line type="monotone" dataKey="pending" stroke="#f59e0b" />
                      <Line type="monotone" dataKey="flagged" stroke="#ef4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent history */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {history.slice(0, 3).map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div>
                      <div className="font-semibold">{h.title}</div>
                      <div className="text-sm text-muted-foreground">{h.institution} • {h.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {h.score && <div className="text-right"><div className="font-medium">{h.score}%</div><div className="text-xs text-muted-foreground">confidence</div></div>}
                      <Badge className={getStatusColor(h.score)}>
                        {h.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => openDetails(h)}>Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Upload */}
        {active === "upload" && (
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
        )}


        {/* Results */}
        {active === "results" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Verification Results</h2>
              <div className="text-sm text-muted-foreground">Detailed evidence & consensus</div>
            </div>

            {!selectedCert && (
              <Card className="mb-6">
                <CardContent>
                  <div className="text-muted-foreground">Select a certificate from History or Upload to view detailed results.</div>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    {history.map((h) => (
                      <div key={h.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium">{h.title}</div>
                          <div className="text-sm text-muted-foreground">{h.institution} • {h.date}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(h.score)}>{h.status}</Badge>
                          <Button size="sm" onClick={() => openDetails(h)}>Open</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedCert && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedCert.title}</CardTitle>
                        <CardDescription>{selectedCert.institution} • {selectedCert.date}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Trust Score</div>
                        <div className="text-2xl font-bold" style={{ color: getStatusColor(selectedCert.score ?? 54).includes('red') ? '#ef4444' : getStatusColor(selectedCert.score ?? 54).includes('emerald') ? '#10b981' : '#f59e0b' }}>
                            {selectedCert.score ?? "—"}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Consensus Panel */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="p-3 rounded-lg border bg-card/60 text-center">
                        <div className="font-semibold">DigiLocker</div>
                        <div className="mt-2">
                          {consensus.digilocker ? <Badge className="bg-emerald-50 text-emerald-700">Matched</Badge> : <Badge className="bg-amber-50 text-amber-700">Not Found</Badge>}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-card/60 text-center">
                        <div className="font-semibold">University DB</div>
                        <div className="mt-2">
                          {consensus.universityDb ? <Badge className="bg-emerald-50 text-emerald-700">Matched</Badge> : <Badge className="bg-amber-50 text-amber-700">Mismatch</Badge>}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-card/60 text-center">
                        <div className="font-semibold">Blockchain</div>
                        <div className="mt-2">
                          {consensus.blockchain ? <Badge className="bg-emerald-50 text-emerald-700">Hash OK</Badge> : <Badge className="bg-amber-50 text-amber-700">No Hash</Badge>}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-card/60 text-center">
                        <div className="font-semibold">Forensic AI</div>
                        <div className="mt-2">
                          {consensus.forensic ? <Badge className="bg-emerald-50 text-emerald-700">No Tamper</Badge> : <Badge className="bg-red-50 text-red-700">Anomaly</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Itemized Breakdown */}
                    <div className="p-4 rounded-lg border shadow-md bg-background/70">
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-dashed">
                            <h4 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Detailed Itemized Verification</h4>
                            <Badge className={`text-sm font-bold ${getStatusColor(selectedCert.score ?? 54)}`}>
                                {selectedCert.score ?? 54}% {selectedCert.status.toUpperCase()}
                            </Badge>
                        </div>

                        {/* Itemized Breakdown Rows */}
                        <div className="space-y-1">
                            {/* NOTE: Using mockVerificationResult.breakdown for consistent demo display */}
                            <VerificationItem label="Name" value={mockVerificationResult.breakdown.name.value} score={mockVerificationResult.breakdown.name.score} status={mockVerificationResult.breakdown.name.status} />
                            <VerificationItem label="Roll No" value={mockVerificationResult.breakdown.roll.value} score={mockVerificationResult.breakdown.roll.score} status={mockVerificationResult.breakdown.roll.status} />
                            <VerificationItem label="Course" value={mockVerificationResult.breakdown.course.value} score={mockVerificationResult.breakdown.course.score} status={mockVerificationResult.breakdown.course.status} />
                            <VerificationItem label="Marks" value={mockVerificationResult.breakdown.marks.value} score={mockVerificationResult.breakdown.marks.score} status={mockVerificationResult.breakdown.marks.status} />
                            <VerificationItem label="Certificate ID" value={mockVerificationResult.breakdown.certId.value} score={mockVerificationResult.breakdown.certId.score} status={mockVerificationResult.breakdown.certId.status} />
                        </div>

                        {/* Key Verdict Alert (Triggered by the mock status) */}
                        {mockVerificationResult.status === 'flagged' && (
                            <div className="mt-4 p-3 border-t border-red-200 text-sm text-red-700 font-medium bg-red-50 rounded-b-lg">
                                <div className="font-bold mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Key Verdict:</div>
                                <p><b>Escalation Required:</b> The overall trust score indicates a discrepancy in the Certificate ID and Name components requiring manual investigation.</p>
                                <div className="font-mono text-xs mt-2 text-muted-foreground truncate">TX ID: {mockVerificationResult.tx}</div>
                            </div>
                        )}
                    </div>
                    
                    {/* Evidence actions */}
                    <div className="flex items-center gap-2 mt-6">
                      <Button onClick={() => downloadEvidence(selectedCert)}>Download Evidence</Button>
                      <Button variant="outline" onClick={() => shareCert(selectedCert)}>Share Link</Button>
                      <Button variant="ghost" onClick={() => setForensicOpen(true)}>Open Forensic Visualizer</Button>
                      <Button 
                          variant="ghost" 
                          className="text-red-600 hover:bg-red-50 ml-auto"
                          onClick={() => {
                              setDisputeCertId(selectedCert.id);
                              setActive('disputes');
                          }}
                      >
                          <MessageSquare className="w-4 h-4 mr-2"/> Raise Dispute
                      </Button>
                    </div>

                  </CardContent>
                </Card>

                {/* Forensic Visualizer Dialog */}
                <Dialog open={forensicOpen} onOpenChange={setForensicOpen}>
                  <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Forensic Visualizer</h3>
                      <div className="text-sm text-muted-foreground">Use slider to compare original vs processed</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Original */}
                      <div className="p-2 border rounded-lg">
                        <div className="text-sm font-medium mb-2">Original Scan</div>
                        <div className="w-full h-48 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={heroImage} alt="original" className="object-cover h-full w-full" />
                        </div>
                      </div>

                      {/* Right: Overlay with slider controlling width */}
                      <div className="p-2 border rounded-lg">
                        <div className="text-sm font-medium mb-2">Forensic Overlay (Tamper Detection)</div>
                        <div className="relative w-full h-48 bg-black/5 rounded-lg overflow-hidden">
                          {/* base image */}
                          <img src={heroImage} alt="forensic-base" className="object-cover h-full w-full absolute inset-0" />
                          {/* overlay (red tint) with variable width */}
                          <div
                            style={{ width: `${overlayWidth}%` }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-red-400 opacity-40"
                          />
                        </div>
                        <div className="mt-3">
                          <input type="range" min={0} max={100} value={overlayWidth} onChange={onSliderChange} className="w-full" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setForensicOpen(false)}>Close</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        )}

        {/* History */}
        {active === "history" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Certificates</h2>
              <div className="text-sm text-muted-foreground">All uploads & verification history</div>
            </div>

            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{h.title}</div>
                    <div className="text-sm text-muted-foreground">{h.institution} • {h.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">{h.score ?? "—"}%</div>
                      <div className="text-xs text-muted-foreground">score</div>
                    </div>
                    <Badge className={getStatusColor(h.score)}>
                      {h.status}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => openDetails(h)}>View</Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadEvidence(h)}><Download className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => shareCert(h)}><Share2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Wallet */}
        {active === "wallet" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Academic Wallet</h2>
              <div className="text-sm text-muted-foreground">Verified certificates you can share</div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallet.length === 0 && <div className="text-muted-foreground">No verified certificates yet.</div>}
              {wallet.map((w) => (
                <div key={w.id} className="p-4 border rounded-lg flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{w.title}</div>
                    <Badge className="bg-emerald-50 text-emerald-700">Verified</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">{w.institution}</div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-muted-foreground font-mono">{w.hash ?? "no-hash"}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => downloadEvidence(w)}>Download</Button>
                      <Button size="sm" variant="outline" onClick={() => shareCert(w)}>Share</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tools */}
        {active === "tools" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Quick Tools</h2>
              <div className="text-sm text-muted-foreground">Fast actions for quick verification</div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>QR Quick Verify</CardTitle>
                  <CardDescription>Scan a certificate QR (demo)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-44 h-44 bg-black/5 rounded-lg flex items-center justify-center border border-dashed">
                    <div className="text-sm text-muted-foreground">QR Scanner Placeholder</div>
                  </div>
                  <Button onClick={() => alert("Open camera & scan (demo)")}>
                    <Camera className="w-4 h-4 mr-2" /> Scan QR
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificate ID Lookup</CardTitle>
                  <CardDescription>Enter certificate ID to quickly lookup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Enter certificate ID (e.g. CERT-001)" value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
                    <Button onClick={handleLookup}><Search className="w-4 h-4" /></Button>
                  </div>
                  {lookupResult && (
                    <div className="mt-2 p-3 border rounded-lg">
                      <div className="font-medium">{lookupResult.title}</div>
                      <div className="text-sm text-muted-foreground">{lookupResult.institution}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary">{lookupResult.status}</Badge>
                        <Button size="sm" onClick={() => openDetails(lookupResult as any)}>Open</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Disputes */}
        {active === "disputes" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Dispute Resolution</h2>
              <div className="text-sm text-muted-foreground">Track and raise disputes</div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Open Disputes</CardTitle>
                  <CardDescription>Recent dispute tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  {disputes.length === 0 && <div className="text-muted-foreground">No disputes</div>}
                  <div className="space-y-3">
                    {disputes.map((d) => (
                      <div key={d.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium">Ticket {d.id}</div>
                          <div className="text-sm text-muted-foreground">Cert: {d.certId} • {d.reason}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium capitalize">{d.status.replace("_", " ")}</div>
                          <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Raise a Dispute</CardTitle>
                  <CardDescription>Open a ticket to notify the issuing institution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Certificate ID</label>
                    <Input value={disputeCertId ?? ""} onChange={(e) => setDisputeCertId(e.target.value)} placeholder="e.g. CERT-003" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason</label>
                    <textarea className="w-full mt-1 p-2 border rounded-md" rows={4} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => raiseDispute()}>Submit Dispute</Button>
                    <Button variant="outline" onClick={() => {
                      setDisputeCertId(null);
                      setDisputeReason("");
                    }}>Reset</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ---------- Small helper components ----------

// Helper Component for Itemized Verification Display
const VerificationItem = ({ label, value, score, status }: any) => {
    // Helper function to dynamically set the color of the status badge
    const getStatusColorClass = (score: number) => {
        if (score >= 90) return 'bg-emerald-100 text-emerald-700';
        if (score >= 70) return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };

    const statusColor = getStatusColorClass(score);

    return (
        <div className="flex justify-between items-start py-3 border-b border-border/50 last:border-b-0">
            {/* Left side: Label and Value */}
            <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                {/* Format Marks as X% */}
                <div className="font-semibold">{label === 'Marks' ? `${value}%` : value}</div> 
            </div>
            {/* Right side: Score and Status Badge */}
            <div className="text-right flex-shrink-0 ml-4">
                <Badge className={`font-semibold text-xs ${statusColor} py-1 px-2`}>
                    {score}% {status.toUpperCase()}
                </Badge>
            </div>
        </div>
    );
};

const SideButton = ({ children, onClick, icon, active }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-md ${
      active ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/10"
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const StatCard = ({ title, value, icon }: any) => (
  <Card>
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div>{icon}</div>
    </CardContent>
  </Card>
);