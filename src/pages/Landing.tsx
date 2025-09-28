import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Building,
  FileCheck,
  Upload,
  Eye,
  ChevronRight,
  GraduationCap,
  UserCheck,
  School,
  Lock,
  Languages,
  Hash,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import heroImage from "@/assets/hero-verification.jpg";

const Landing = () => {
  const navigate = useNavigate();

  // Demo verification state
  const [demoRunning, setDemoRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fields, setFields] = useState<
    { name: string; value: string; confidence: number; status: string }[]
  >([]);

  const runDemo = () => {
    setDemoRunning(true);
    setProgress(0);
    setFields([]);

    const mockFields = [
      { name: "Name", value: "Rahul Kumar", confidence: 96, status: "✅" },
      { name: "Roll No", value: "JH2021-0456", confidence: 92, status: "✅" },
      { name: "Marks", value: "78%", confidence: 75, status: "⚠️" },
      {
        name: "Certificate ID",
        value: "CERT-XYZ-1234",
        confidence: 99,
        status: "✅",
      },
    ];

    mockFields.forEach((f, i) => {
      setTimeout(() => {
        setFields((prev) => [...prev, f]);
        setProgress(((i + 1) / mockFields.length) * 100);
      }, (i + 1) * 1200);
    });
  };

  const userRoles = [
    {
      type: "student",
      title: "Student Portal",
      description: "Submit and verify your certificates with advanced security",
      icon: GraduationCap,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/student",
    },
    {
      type: "verifier",
      title: "Verifier Dashboard",
      description: "Professional verification tools and fraud detection",
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
      route: "/verifier",
    },
    {
      type: "institution",
      title: "Institution Panel",
      description: "Manage certificates and institutional credentials",
      icon: School,
      color: "text-warning",
      bgColor: "bg-warning/10",
      route: "/institution",
    },
    {
      type: "admin",
      title: "Admin Control",
      description: "System administration and analytics oversight",
      icon: Lock,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      route: "/admin",
    },
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: "Forensic Tamper Detection",
      description:
        "Visual overlays highlight altered grades, photos, and signatures",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description:
        "Supports students, verifiers, institutions, and administrators",
      color: "text-success",
    },
    {
      icon: Building,
      title: "Institution Trust Score",
      description:
        "Real-time credibility scoring & reputation analytics for universities",
      color: "text-warning",
    },
    {
      icon: FileCheck,
      title: "Explainable AI Verdicts",
      description:
        "Get not just valid/invalid, but field-level evidence and reasoning",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 gradient-primary rounded-lg shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VeriSure</h1>
              <p className="text-xs text-muted-foreground">
                Authenticity Validator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Govt Pilot
            </Badge>
            <Button variant="ghost" size="sm">
              <Languages className="w-4 h-4 mr-1" /> EN | हिन्दी
            </Button>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hackathon Badge */}
      <div className="bg-gradient-to-r from-primary to-success py-2 text-white text-sm text-center">
        Smart India Hackathon 2025 • Problem Statement: Authenticity Validator
        for Academia • Team VeriSure
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Government-Grade Security
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Instant, Evidence-Grade
              <span className="gradient-text"> Verification</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Multi-layer verification system with blockchain proof, forensic
              overlays, AI-powered OCR, and institution trust scoring — all in
              under 30 seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="gradient-primary text-white shadow hover:shadow-lg"
                onClick={() => navigate("/student")}
              >
                <Upload className="w-5 h-5 mr-2" />
                Verify Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={runDemo}
                disabled={demoRunning}
              >
                <Eye className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            </div>

            {/* Demo Panel */}
            {demoRunning && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Demo Verification Progress</CardTitle>
                  <CardDescription>
                    Simulated field extraction & validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="mb-4" />
                  <ul className="space-y-2 text-sm">
                    {fields.map((f, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center border-b pb-1"
                      >
                        <span>
                          {f.name}: {f.value}
                        </span>
                        <span>
                          <Badge variant="outline">{f.confidence}%</Badge>{" "}
                          <span>{f.status}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {progress === 100 && (
                    <div className="mt-4 space-y-2">
                      <Badge className="bg-green-100 text-green-700 border">
                        Blockchain Hash Matched <Hash className="w-4 h-4 ml-1" />
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Overall Verification Score: 87%
                      </p>
                      <Button size="sm" className="mt-2" variant="secondary">
                        Download Evidence Packet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Verification visualization"
              className="w-full h-auto rounded-2xl shadow"
            />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Choose Your Role</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Access tailored dashboards designed for your specific needs in the
            verification ecosystem.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role) => (
              <Card
                key={role.type}
                className="cursor-pointer hover:shadow-lg transition transform hover:scale-105"
                onClick={() => navigate(role.route)}
              >
                <CardContent className="pt-6 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${role.bgColor} mb-4`}
                  >
                    <role.icon className={`w-8 h-8 ${role.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {role.description}
                  </p>
                  <Button variant="ghost" size="sm" className="w-full">
                    Access Dashboard <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Why Our Solution Wins</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Unique features that set us apart — delivering explainability,
            forensic overlays, and trust analytics.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, i) => (
              <Card
                key={i}
                className="text-center hover:shadow-md transition"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Strip */}
      <section className="bg-primary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-bold">95%+</h3>
            <p className="text-muted-foreground">OCR Accuracy</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">500+</h3>
            <p className="text-muted-foreground">Fake Certificates Detected</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">Legal</h3>
            <p className="text-muted-foreground">Evidence Package Support</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 text-center text-sm text-muted-foreground">
        Built for Govt of Jharkhand | SIH 2025 • Privacy • API Docs • Contact •
        Team
      </footer>
    </div>
  );
};

export default Landing;
