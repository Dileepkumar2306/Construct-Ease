import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-ai-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-hub.component.html',
  styleUrl: './ai-hub.component.css'
})
export class AiHubComponent implements OnInit {
  private api = inject(ApiService);
  private uploadService = inject(UploadService);
  isUploadingDesignImage = false;

  activeTab = 'dashboard';

  // ── Dashboard ────────────────────────────────────────────────────────────────
  dashboardData: any = null;
  dashboardLoading = true;

  // ── 1. AI Cost Estimator ─────────────────────────────────────────────────────
  estArea     = 1200;
  estCity     = 'mumbai';
  estFloors   = 1;
  estQuality  = 'standard';
  estType     = 'residential';
  estLoading  = false;
  estResult: any = null;
  estError    = '';

  // ── 2. Contract Risk Scanner ─────────────────────────────────────────────────
  contractText = '';
  riskLoading  = false;
  riskResult: any = null;
  riskError   = '';
  sampleContract = `This Agreement is entered into between the Contractor and the Client. 
The Client shall indemnify all third-party claims arising from the project. 
Any dispute arising hereunder shall be resolved by mandatory arbitration only.
This contract shall auto-renew unless terminated with 90 days notice.
The Contractor may unilaterally modify the scope of work at any time.
All intellectual property created during this project belongs to the Contractor.
The Client waives all rights to seek remedies in any court of law.
Services are provided as-is without any warranty of any kind.
There shall be no cap on liability for damages incurred.`;

  // ── 3. Room Planner ──────────────────────────────────────────────────────────
  roomArea    = 1800;
  roomCount   = 3;
  roomStyle   = 'modern';
  roomFloors  = 1;
  roomLoading = false;
  roomResult: any = null;
  roomError   = '';

  // ── 4. Timeline Predictor ────────────────────────────────────────────────────
  timeArea      = 1500;
  timeQuality   = 'standard';
  timeStartDate = new Date().toISOString().split('T')[0];
  timeType      = 'residential';
  timeLoading   = false;
  timeResult: any = null;
  timeError     = '';

  // ── 5. Architecture Recommender ──────────────────────────────────────────────
  archBudget     = 'medium';
  archRegion     = 'urban';
  archPreference = 'modern';
  archPlotSize   = 1500;
  archLoading    = false;
  archResult: any = null;
  archError      = '';

  // ── 6. Material Price Tracker ────────────────────────────────────────────────
  availableMaterials = ['cement','steel','sand','bricks','paint','tiles','aggregate','plywood'];
  selectedMaterials: string[] = ['cement','steel','sand','bricks'];
  matLoading = false;
  matResult: any = null;
  matError   = '';
  designImage      = '';
  designRoomType   = 'living-room';
  designStyle      = 'modern';
  designLoading    = false;
  designResult: any = null;
  designError      = '';

  readonly tabs = [
    { id: 'dashboard',  label: 'AI Dashboard',       icon: 'fa-gauge-high'      },
    { id: 'estimate',   label: 'Cost Estimator',      icon: 'fa-calculator'      },
    { id: 'contract',   label: 'Contract Scanner',    icon: 'fa-file-shield'     },
    { id: 'room',       label: 'Room Planner',        icon: 'fa-house-chimney'   },
    { id: 'timeline',   label: 'Timeline',            icon: 'fa-calendar-days'   },
    { id: 'arch',       label: 'Arch. Recommender',  icon: 'fa-compass-drafting' },
    { id: 'material',   label: 'Material Prices',     icon: 'fa-chart-line'      },
    { id: 'design',     label: 'Paint & Tiles AI',    icon: 'fa-palette'         }
  ];

  ngOnInit() {
    this.loadDashboard();
  }

  setTab(id: string) {
    this.activeTab = id;
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  loadDashboard() {
    this.dashboardLoading = true;
    this.api.aiDashboard().subscribe({
      next: (data) => { this.dashboardData = data; this.dashboardLoading = false; },
      error: ()    => {
        // Fallback mock data for offline/error state
        this.dashboardData = {
          totalAnalyses: 247, contractsScanned: 38, estimatesGenerated: 94,
          roomsPlanned: 61, timelinesCreated: 29, avgRiskScore: 42,
          recentActivity: [
            { feature: 'cost-estimate', time: '2 min ago', summary: '2400 sqft Premium, Mumbai' },
            { feature: 'contract-risk', time: '15 min ago', summary: 'Risk: MODERATE (score 28)' },
            { feature: 'room-planner',  time: '32 min ago', summary: '3BHK Modern, 1800 sqft' }
          ]
        };
        this.dashboardLoading = false;
      }
    });
  }

  featureLabel(f: string): string {
    const map: any = {
      'cost-estimate': '🏗️ Cost Estimate', 'contract-risk': '📄 Contract Scan',
      'room-planner':  '🏠 Room Plan',     'timeline': '📅 Timeline',
      'arch-recs':     '🏛️ Arch. Rec',    'material-price': '📈 Material Price',
      'design-suggest': '🎨 Paint & Tiles AI'
    };
    return map[f] || f;
  }

  // ── 1. Cost Estimator ────────────────────────────────────────────────────────
  runEstimate() {
    this.estLoading = true; this.estResult = null; this.estError = '';
    this.api.aiEstimate({
      area: this.estArea, city: this.estCity, floors: this.estFloors,
      quality: this.estQuality, projectType: this.estType
    }).subscribe({
      next: (r) => { this.estResult = r; this.estLoading = false; },
      error: (e) => { this.estError = 'Estimation failed. Is the server running?'; this.estLoading = false; }
    });
  }

  get breakdownEntries(): { label: string; value: number; pct: number; color: string }[] {
    if (!this.estResult) return [];
    const b = this.estResult.breakdown;
    const total = this.estResult.summary.totalCost;
    return [
      { label: 'Materials',  value: b.materials,  pct: Math.round(b.materials / total * 100),  color: '#e0a96d' },
      { label: 'Steel',      value: b.steel,      pct: Math.round(b.steel / total * 100),      color: '#60a5fa' },
      { label: 'Labor',      value: b.labor,      pct: Math.round(b.labor / total * 100),      color: '#34d399' },
      { label: 'Finishing',  value: b.finishing,  pct: Math.round(b.finishing / total * 100),  color: '#a78bfa' },
      { label: 'Misc',       value: b.misc,       pct: Math.round(b.misc / total * 100),       color: '#f87171' }
    ];
  }

  // ── 2. Contract Scanner ──────────────────────────────────────────────────────
  loadSample() { this.contractText = this.sampleContract; }

  runRiskScan() {
    this.riskLoading = true; this.riskResult = null; this.riskError = '';
    this.api.aiRiskScan(this.contractText).subscribe({
      next: (r) => { this.riskResult = r; this.riskLoading = false; },
      error: ()  => { this.riskError = 'Risk scan failed. Is the server running?'; this.riskLoading = false; }
    });
  }

  severityClass(s: string): string {
    return s === 'HIGH' ? 'badge-high' : s === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  }

  riskLevelClass(): string {
    const l = this.riskResult?.riskLevel;
    return l === 'DANGEROUS' ? 'risk-danger' : l === 'RISKY' ? 'risk-risky' : l === 'MODERATE' ? 'risk-moderate' : 'risk-safe';
  }

  // ── 3. Room Planner ──────────────────────────────────────────────────────────
  runRoomPlan() {
    this.roomLoading = true; this.roomResult = null; this.roomError = '';
    this.api.aiRoomPlanner({
      totalArea: this.roomArea, rooms: this.roomCount,
      style: this.roomStyle, floors: this.roomFloors
    }).subscribe({
      next: (r) => { this.roomResult = r; this.roomLoading = false; },
      error: ()  => { this.roomError = 'Room planning failed. Is the server running?'; this.roomLoading = false; }
    });
  }

  // ── 4. Timeline ──────────────────────────────────────────────────────────────
  runTimeline() {
    this.timeLoading = true; this.timeResult = null; this.timeError = '';
    this.api.aiTimeline({
      area: this.timeArea, quality: this.timeQuality,
      startDate: this.timeStartDate, projectType: this.timeType
    }).subscribe({
      next: (r) => { this.timeResult = r; this.timeLoading = false; },
      error: ()  => { this.timeError = 'Timeline prediction failed. Is the server running?'; this.timeLoading = false; }
    });
  }

  phaseWidth(duration: string, total: number): number {
    const days = parseInt(duration);
    return Math.max(8, Math.round((days / total) * 100));
  }

  // ── 5. Architecture Recommender ──────────────────────────────────────────────
  runArchRecs() {
    this.archLoading = true; this.archResult = null; this.archError = '';
    this.api.aiArchRecs({
      budget: this.archBudget, region: this.archRegion,
      preference: this.archPreference, plotSize: this.archPlotSize
    }).subscribe({
      next: (r) => { this.archResult = r; this.archLoading = false; },
      error: ()  => { this.archError = 'Recommendation failed. Is the server running?'; this.archLoading = false; }
    });
  }

  rankLabel(rank: number): string {
    return rank === 1 ? '🥇 Best Match' : rank === 2 ? '🥈 Great Choice' : '🥉 Solid Option';
  }

  // ── 6. Material Prices ────────────────────────────────────────────────────────
  toggleMaterial(m: string) {
    const idx = this.selectedMaterials.indexOf(m);
    if (idx > -1) {
      if (this.selectedMaterials.length > 1) this.selectedMaterials.splice(idx, 1);
    } else {
      this.selectedMaterials.push(m);
    }
  }

  isMaterialSelected(m: string): boolean {
    return this.selectedMaterials.includes(m);
  }

  runMaterialPrice() {
    this.matLoading = true; this.matResult = null; this.matError = '';
    this.api.aiMaterialPrice(this.selectedMaterials).subscribe({
      next: (r) => { this.matResult = r; this.matLoading = false; },
      error: ()  => { this.matError = 'Price fetch failed. Is the server running?'; this.matLoading = false; }
    });
  }

  trendIcon(trend: string): string {
    return trend === 'rising' ? 'fa-arrow-trend-up' : trend === 'falling' ? 'fa-arrow-trend-down' : 'fa-minus';
  }

  trendClass(trend: string): string {
    return trend === 'rising' ? 'trend-up' : trend === 'falling' ? 'trend-down' : 'trend-stable';
  }

  volatilityClass(v: string): string {
    return v === 'HIGH' ? 'vol-high' : v === 'MEDIUM' ? 'vol-medium' : 'vol-low';
  }

  onDesignImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.isUploadingDesignImage = true;
      this.uploadService.uploadFileSimple(file, 'ai-uploads').subscribe({
        next: (url) => {
          this.designImage = url;
          this.isUploadingDesignImage = false;
        },
        error: (err) => {
          console.error('Upload failed:', err);
          alert('Failed to upload photo to Supabase storage.');
          this.isUploadingDesignImage = false;
        }
      });
    }
  }

  runDesignSuggest() {
    if (!this.designImage) {
      this.designError = 'Please upload or snap a photo of the area under construction.';
      return;
    }
    this.designLoading = true;
    this.designResult = null;
    this.designError = '';

    this.api.aiDesignSuggest({
      image: this.designImage,
      roomType: this.designRoomType,
      style: this.designStyle
    }).subscribe({
      next: (r) => {
        this.designResult = r;
        this.designLoading = false;
        this.loadDashboard();
      },
      error: (e) => {
        this.designError = 'AI generation failed. Please try again.';
        this.designLoading = false;
      }
    });
  }
}
