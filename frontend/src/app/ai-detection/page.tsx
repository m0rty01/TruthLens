"use client";
import { useState } from "react";
import { PageHeader, ScoreGauge } from "@/components/ui";
import { Eye, Upload, Link as LinkIcon, AlertTriangle, CheckCircle, XCircle, Loader2, FileImage, FileVideo, FileText, RotateCcw } from "lucide-react";
import { useApiMutation } from "@/hooks/useApi";
import { aiDetectionApi } from "@/lib/api";

interface AnalysisResult {
  overallScore: number;
  classification: string;
  signals: {
    imageManipulation?: number;
    textCoherence?: number;
    metadataAnomalies?: number;
    deepfakeIndicators?: number;
  };
}

const sampleQueue = [
  { id: "aq-1", type: "image", name: "screenshot_viral_x.png", status: "analyzed" as const, score: 87, classification: "Likely AI-Generated", submittedAt: "2 hours ago" },
  { id: "aq-2", type: "video", name: "tiktok_housing_claim.mp4", status: "analyzed" as const, score: 23, classification: "Likely Authentic", submittedAt: "5 hours ago" },
  { id: "aq-3", type: "text", name: "reddit_post_narr-001", status: "pending" as const, score: null, classification: "Pending", submittedAt: "1 hour ago" },
  { id: "aq-4", type: "image", name: "facebook_meme_claim.jpg", status: "analyzed" as const, score: 65, classification: "Manipulated", submittedAt: "8 hours ago" },
  { id: "aq-5", type: "video", name: "youtube_news_clip.mp4", status: "analyzed" as const, score: 12, classification: "Likely Authentic", submittedAt: "1 day ago" },
];

const typeIcons: Record<string, React.ReactNode> = {
  image: <FileImage className="w-4 h-4" />,
  video: <FileVideo className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
};

export default function AIDetectionPage() {
  const [url, setUrl] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const { execute: analyze, loading: analyzing, data: analysisResult } = useApiMutation<unknown, AnalysisResult>(
    () => aiDetectionApi.analyze() as Promise<AnalysisResult>
  );

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    try {
      await analyze({});
    } catch { /* handled by hook */ }
  };

  const selected = sampleQueue.find((i) => i.id === selectedItem);

  return (
    <div className="space-y-6">
      <PageHeader title="AI Manipulation Detection" description="Detect deepfakes, AI-generated content, and manipulated media" />

      {/* Submit for Analysis */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" /> Submit Content for Analysis
        </h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL of image, video, or text to analyze..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <button onClick={handleAnalyze} disabled={analyzing || !url.trim()} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Analyze
          </button>
        </div>

        <div className="mt-4 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Drag and drop content or <span className="text-primary font-medium">browse files</span></p>
          <p className="text-xs text-muted-foreground mt-1">Supports images (PNG, JPG), videos (MP4, MOV), and text files</p>
        </div>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-card-foreground mb-4">Latest Analysis Result</h3>
          <div className="flex items-start gap-6">
            <ScoreGauge score={analysisResult.overallScore ?? 50} label="AI Likelihood" size="lg" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                {(analysisResult.overallScore ?? 0) > 70 ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (analysisResult.overallScore ?? 0) > 40 ? (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                <span className="font-semibold text-card-foreground">{analysisResult.classification || "Analysis Complete"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Image Manipulation", score: analysisResult.signals?.imageManipulation },
                  { label: "Text Coherence", score: analysisResult.signals?.textCoherence },
                  { label: "Metadata Anomalies", score: analysisResult.signals?.metadataAnomalies },
                  { label: "Deepfake Indicators", score: analysisResult.signals?.deepfakeIndicators },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${(s.score ?? 0) > 70 ? "bg-destructive" : (s.score ?? 0) > 40 ? "bg-warning" : "bg-success"}`} style={{ width: `${s.score ?? 50}%` }} />
                      </div>
                      <span className="text-xs font-medium">{s.score ?? 50}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Queue */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Analysis Queue</h3>
          <span className="text-xs text-muted-foreground">{sampleQueue.filter((i) => i.status === "pending").length} pending</span>
        </div>
        <div className="space-y-3">
          {sampleQueue.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                selectedItem === item.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">{typeIcons[item.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.submittedAt}</p>
              </div>
              {item.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ScoreGauge score={item.score!} size="sm" />
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.classification === "Likely AI-Generated" || item.classification === "Manipulated" ? "bg-red-100 text-red-700" :
                    item.classification === "Likely Authentic" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>{item.classification}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detection Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <FileImage className="w-6 h-6" />, title: "Deepfake Detection", desc: "GAN fingerprints, face swapping artifacts, inconsistent lighting analysis", items: ["Face landmark analysis", "Temporal consistency", "Compression artifacts"] },
          { icon: <FileVideo className="w-6 h-6" />, title: "Video Manipulation", desc: "Frame-level analysis, audio sync detection, splice identification", items: ["Frame interpolation detection", "Audio-visual sync", "Re-encoding traces"] },
          { icon: <FileText className="w-6 h-6" />, title: "AI-Generated Text", desc: "Language model fingerprinting, burst analysis, perplexity scoring", items: ["GPT detection", "Burstiness analysis", "Perplexity scoring"] },
        ].map((cap, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-3">{cap.icon}</div>
            <h3 className="font-semibold text-card-foreground mb-1">{cap.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{cap.desc}</p>
            <ul className="space-y-1">
              {cap.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-success" /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
