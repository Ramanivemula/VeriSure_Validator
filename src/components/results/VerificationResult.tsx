import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  Database, 
  Image, 
  Fingerprint,
  Download,
  Share,
  Clock,
  Building,
  User,
  Calendar,
  Award
} from "lucide-react";

interface VerificationField {
  field: string;
  value: string;
  status: 'verified' | 'warning' | 'failed' | 'pending';
  confidence: number;
  sources: string[];
}

const VerificationResults = () => {
  const overallScore = 94;
  const verificationTime = "2.3 seconds";
  
  const verificationLayers = [
    {
      name: "Blockchain Verification",
      status: "verified" as const,
      confidence: 98,
      icon: Shield,
      description: "Hash verified on institutional blockchain"
    },
    {
      name: "Database Matching",
      status: "verified" as const,
      confidence: 96,
      icon: Database,
      description: "Record found in institutional database"
    },
    {
      name: "Forensic Analysis",
      status: "warning" as const,
      confidence: 87,
      icon: Image,
      description: "Minor image compression detected"
    },
    {
      name: "Digital Signature",
      status: "verified" as const,
      confidence: 99,
      icon: Fingerprint,
      description: "Valid institutional digital signature"
    }
  ];

  const certificateFields: VerificationField[] = [
    {
      field: "Student Name",
      value: "Rajesh Kumar Singh",
      status: "verified",
      confidence: 98,
      sources: ["Database", "OCR", "Blockchain"]
    },
    {
      field: "Institution",
      value: "Indian Institute of Technology Delhi",
      status: "verified",
      confidence: 99,
      sources: ["Database", "Blockchain", "Registry"]
    },
    {
      field: "Degree",
      value: "Bachelor of Technology in Computer Science",
      status: "verified",
      confidence: 97,
      sources: ["Database", "OCR"]
    },
    {
      field: "Issue Date",
      value: "June 15, 2023",
      status: "verified",
      confidence: 95,
      sources: ["Database", "OCR"]
    },
    {
      field: "Certificate ID",
      value: "IIT-CSE-2023-456789",
      status: "verified",
      confidence: 100,
      sources: ["Database", "Blockchain", "QR Code"]
    },
    {
      field: "Signature Authority",
      value: "Dr. Priya Sharma, Registrar",
      status: "warning",
      confidence: 85,
      sources: ["Database", "Digital Signature"]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground animate-pulse-soft" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Overall Verification Score */}
      <Card className="shadow-strong border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`p-4 rounded-full ${overallScore >= 90 ? 'bg-success/10' : overallScore >= 70 ? 'bg-warning/10' : 'bg-destructive/10'}`}>
              {overallScore >= 90 ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : overallScore >= 70 ? (
                <AlertTriangle className="w-12 h-12 text-warning" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground">{overallScore}%</div>
              <div className="text-sm text-muted-foreground">Verification Score</div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Certificate Verification Complete
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Completed in {verificationTime} • Multi-layer authentication passed
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="success" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Share className="w-4 h-4" />
              <span>Share Results</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Verification Layers */}
        <Card className="shadow-medium border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Verification Layers
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Multi-layer authentication results
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {verificationLayers.map((layer, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className={`p-2 rounded-lg ${getStatusColor(layer.status).replace('text-', 'bg-').replace('border-', '').replace(/\/\d+/g, '/10')}`}>
                  <layer.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground">{layer.name}</h4>
                    {getStatusIcon(layer.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{layer.description}</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={layer.confidence} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-foreground">{layer.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certificate Information */}
        <Card className="shadow-medium border-0 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Certificate Details
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Extracted and verified information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {certificateFields.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">{field.field}</span>
                    <Badge className={getStatusColor(field.status)}>
                      {field.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{field.value}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {field.sources.map((source, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{field.confidence}%</div>
                  {getStatusIcon(field.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Institution Trust Score */}
      <Card className="shadow-medium border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Institution Trust Analysis
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Institutional credibility and verification history
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Building className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">A+</div>
              <div className="text-sm text-muted-foreground">Trust Grade</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">2,847</div>
              <div className="text-sm text-muted-foreground">Certificates Issued</div>
            </div>
            <div className="text-center">
              <User className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">99.7%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">15 Years</div>
              <div className="text-sm text-muted-foreground">Platform History</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationResults;