import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MlService, AbsencePrediction, AnomalyResult }
  from '../../core/services/ml.service';
import { forkJoin } from 'rxjs';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

type Tab = 'absences' | 'anomalies';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  // Header
  brain:       `<svg width="28" height="28" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z"/></svg>`,
  calendar:    `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  search:      `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  // Status
  wifi:        `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>`,
  wifiOff:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a11 11 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>`,
  // Risk levels — colored dots
  dotRed:      `<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#e53e3e"/></svg>`,
  dotAmber:    `<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#d69e2e"/></svg>`,
  dotTeal:     `<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#0e9daf"/></svg>`,
  dotGreen:    `<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#38a169"/></svg>`,
  // Anomaly severity
  alert:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  warning:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  eye:         `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  checkCircle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  // Anomaly types
  clock:       `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  door:        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/><polyline points="17 8 21 12 17 16"/><line x1="21" y1="12" x2="10" y2="12"/></svg>`,
  msgAlert:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  banknote:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  arrowReturn: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  // Model icons
  treeDecision:`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2L12 8M12 8L6 14M12 8L18 14M6 14L6 20M18 14L18 20"/><circle cx="12" cy="2" r="2" fill="currentColor" stroke="none"/><circle cx="6" cy="14" r="2" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r="2" fill="currentColor" stroke="none"/><circle cx="6" cy="20" r="2" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="2" fill="currentColor" stroke="none"/></svg>`,
  scatter:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="7" cy="8" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="5" cy="15" r="2" fill="currentColor" stroke="none"/><circle cx="17" cy="15" r="2" fill="currentColor" stroke="none"/><circle cx="11" cy="19" r="2" fill="currentColor" stroke="none"/><circle cx="20" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/></svg>`,
  // Conseil
  bulb:        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  // Loader
  loader:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
};

@Component({
  selector: 'app-ml-insights',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
<div class="ml-insights fade-in">

  <!-- ── AI Header ── -->
  <div class="ai-header">
    <div class="aih-left">
      <div class="aih-icon"><span [innerHTML]="ic.brain | safeHtml"></span></div>
      <div>
        <h1>Intelligence Artificielle RH</h1>
        <p>Analyse prédictive &nbsp;·&nbsp; Random Forest &nbsp;·&nbsp; Isolation Forest</p>
      </div>
    </div>
    <div class="aih-status" [class.online]="mlOnline()" [class.offline]="!mlOnline()">
      <span class="status-dot"></span>
      <span [innerHTML]="(mlOnline() ? ic.wifi : ic.wifiOff) | safeHtml"></span>
      {{ mlOnline() ? 'ML Service actif' : 'ML indisponible' }}
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="ai-tabs">
    <button class="ai-tab" [class.active]="activeTab() === 'absences'" (click)="setTab('absences')">
      <div class="at-icon-wrap absences">
        <span [innerHTML]="ic.calendar | safeHtml"></span>
      </div>
      <div class="at-text">
        <span class="at-title">Prédiction d'absences</span>
        <span class="at-sub">Random Forest</span>
      </div>
      <span class="at-badge warning" *ngIf="absenceStats()?.risqueEleve > 0">
        {{ absenceStats()?.risqueEleve }} risques élevés
      </span>
    </button>
    <button class="ai-tab" [class.active]="activeTab() === 'anomalies'" (click)="setTab('anomalies')">
      <div class="at-icon-wrap anomalies">
        <span [innerHTML]="ic.search | safeHtml"></span>
      </div>
      <div class="at-text">
        <span class="at-title">Détection d'anomalies</span>
        <span class="at-sub">Isolation Forest</span>
      </div>
      <span class="at-badge danger" *ngIf="anomalyStats()?.critiques > 0">
        {{ anomalyStats()?.critiques }} critiques
      </span>
    </button>
  </div>

  <!-- ── Loading ── -->
  <div class="ai-loading" *ngIf="loading()">
    <div class="spin-wrap"><span [innerHTML]="ic.loader | safeHtml"></span></div>
    <p>Analyse en cours par l'IA…</p>
  </div>

  <!-- ===================== ABSENCES ===================== -->
  <div *ngIf="!loading() && activeTab() === 'absences'" class="tab-content fade-in">

    <div class="stats-band">
      <div class="sb-item">
        <span class="sb-val teal">{{ absenceStats()?.total || 0 }}</span>
        <span class="sb-label">Analysés</span>
      </div>
      <div class="sb-item">
        <span class="sb-val red">{{ absenceStats()?.risqueEleve || 0 }}</span>
        <span class="sb-label">Risque élevé</span>
      </div>
      <div class="sb-item">
        <span class="sb-val amber">{{ absenceStats()?.risqueMoyen || 0 }}</span>
        <span class="sb-label">Risque moyen</span>
      </div>
      <div class="sb-item">
        <span class="sb-val">{{ absenceStats()?.tauxRisqueGlobal || 0 }}%</span>
        <span class="sb-label">Taux risque global</span>
      </div>
    </div>

    <div class="model-info">
      <div class="mi-icon teal"><span [innerHTML]="ic.treeDecision | safeHtml"></span></div>
      <div class="mi-badge">Random Forest</div>
      <span>Entraîné sur l'historique des absences, fréquence, saisonnalité. Précision estimée : <strong>~82%</strong></span>
    </div>

    <div class="predictions-grid">
      <div class="pred-card" *ngFor="let p of predictions()" [class]="'risk-' + p.risque.toLowerCase()">

        <div class="pc-top-bar"></div>

        <div class="pc-header">
          <div class="pc-avatar">{{ getInitiales(p.employeNom) }}</div>
          <div class="pc-info">
            <strong>{{ p.employeNom }}</strong>
          </div>
          <div class="pc-risk-badge" [class]="getRiskClass(p.risque)">
            <span [innerHTML]="getRiskDot(p.risque) | safeHtml"></span>
            {{ getRiskLabel(p.risque) }}
          </div>
        </div>

        <div class="pc-proba">
          <div class="pp-label">
            <span>Probabilité d'absence</span>
            <strong [class]="getProbaColor(p.probabilite)">{{ p.probabilite }}%</strong>
          </div>
          <div class="pp-track">
            <div class="pp-fill" [style.width]="p.probabilite + '%'" [class]="getProbaColor(p.probabilite)"></div>
          </div>
        </div>

        <div class="pc-factors" *ngIf="p.facteurs?.length">
          <span class="pf-label">Facteurs :</span>
          <span class="pf-tag" *ngFor="let f of p.facteurs">{{ f }}</span>
        </div>

        <div class="pc-conseil">
          <span [innerHTML]="ic.bulb | safeHtml"></span>
          {{ p.conseil }}
        </div>

      </div>
    </div>
  </div>

  <!-- ===================== ANOMALIES ===================== -->
  <div *ngIf="!loading() && activeTab() === 'anomalies'" class="tab-content fade-in">

    <div class="stats-band">
      <div class="sb-item">
        <span class="sb-val teal">{{ anomalyStats()?.total || 0 }}</span>
        <span class="sb-label">Analysés</span>
      </div>
      <div class="sb-item">
        <span class="sb-val red">{{ anomalyStats()?.critiques || 0 }}</span>
        <span class="sb-label">Critiques</span>
      </div>
      <div class="sb-item">
        <span class="sb-val amber">{{ anomalyStats()?.alertes || 0 }}</span>
        <span class="sb-label">Alertes</span>
      </div>
      <div class="sb-item">
        <span class="sb-val green">{{ anomalyStats()?.normaux || 0 }}</span>
        <span class="sb-label">Normaux</span>
      </div>
    </div>

    <div class="model-info">
      <div class="mi-icon red"><span [innerHTML]="ic.scatter | safeHtml"></span></div>
      <div class="mi-badge red">Isolation Forest</div>
      <span>Détecte les comportements statistiquement inhabituels. Seuil de contamination : <strong>10%</strong></span>
    </div>

    <div class="anomalies-list">
      <div class="anom-card" *ngFor="let a of anomalies()" [class]="'niveau-' + a.niveau.toLowerCase()">

        <div class="anom-accent"></div>

        <div class="ac-header">
          <div class="ac-left">
            <div class="ac-avatar">{{ getInitiales(a.employeNom) }}</div>
            <div>
              <strong>{{ a.employeNom }}</strong>
              <div class="ac-score">
                Score anomalie :
                <span [class]="getScoreColor(a.scoreAnomalie)"><strong>{{ a.scoreAnomalie }}%</strong></span>
              </div>
            </div>
          </div>
          <span class="niveau-badge" [class]="getNiveauClass(a.niveau)">
            <span [innerHTML]="getNiveauIconSvg(a.niveau) | safeHtml"></span>
            {{ a.niveau }}
          </span>
        </div>

        <!-- Score bar -->
        <div class="score-bar-wrap">
          <div class="score-track">
            <div class="score-fill" [style.width]="a.scoreAnomalie + '%'" [class]="getScoreColor(a.scoreAnomalie)"></div>
          </div>
        </div>

        <div class="anom-detected" *ngIf="a.anomalies?.length ?? 0 > 0">
          <div class="ad-item" *ngFor="let det of a.anomalies" [class]="'sev-' + det.severite.toLowerCase()">
            <span class="ad-icon" [innerHTML]="getSeveriteIconSvg(det.severite) | safeHtml"></span>
            <div>
              <span class="ad-type">{{ getAnomalyTypeLabel(det.type) }}</span>
              <span class="ad-icon-type" [innerHTML]="getAnomalyTypeIconSvg(det.type) | safeHtml"></span>
              <small>{{ det.detail }}</small>
            </div>
          </div>
        </div>

        <div class="anom-normal" *ngIf="a.anomalies?.length === 0">
          <span [innerHTML]="ic.checkCircle | safeHtml"></span>
          Comportement normal — aucune anomalie détectée
        </div>

        <div class="anom-rec" *ngIf="a.anomalies?.length ?? 0 > 0">
          <span [innerHTML]="ic.bulb | safeHtml"></span>
          {{ a.recommandation }}
        </div>

      </div>
    </div>
  </div>

</div>
  `,
  styles: [`
    :host {
      --c-teal:    #0e9daf;
      --c-teal-dk: #0b7d8e;
      --c-teal-lt: #e6f7f9;
      --c-green:   #38a169;
      --c-green-lt:#c6f6d5;
      --c-amber:   #d69e2e;
      --c-amber-lt:#fefcbf;
      --c-red:     #e53e3e;
      --c-red-lt:  #fed7d7;
      --c-blue:    #3182ce;
      --c-blue-lt: #bee3f8;
      --c-text:    #1a202c;
      --c-muted:   #718096;
      --c-gray100: #eef0f3;
      --c-gray200: #e2e8f0;
      --r:    12px;
      --r-lg: 16px;
      --sh:   0 2px 12px rgba(11,110,126,0.08);
      --sh-md:0 6px 24px rgba(11,110,126,0.13);
    }

    .ml-insights { max-width: 1200px; padding-bottom: 48px; }

    /* ── Header ── */
    .ai-header {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, #09202f 0%, #0d2d46 50%, #0f3a5c 100%);
      border-radius: 20px; padding: 26px 30px; margin-bottom: 22px;
      flex-wrap: wrap; gap: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .aih-left { display: flex; align-items: center; gap: 18px; }
    .aih-icon {
      width: 64px; height: 64px; background: rgba(18,181,196,0.2);
      border: 1.5px solid rgba(18,181,196,0.35); border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; backdrop-filter: blur(4px);
      svg { display: block; }
    }
    .aih-left h1 { font-size: 21px; font-weight: 800; color: white; margin-bottom: 5px; }
    .aih-left p  { font-size: 13px; color: rgba(255,255,255,0.55); }

    .aih-status {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 20px;
      font-size: 13px; font-weight: 600;
      svg { display: block; flex-shrink: 0; }
      &.online  { background: rgba(72,187,120,0.18); color: #c6f6d5; svg { stroke: #68d391; } }
      &.offline { background: rgba(245,101,101,0.18); color: #fed7d7; svg { stroke: #fc8181; } }
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      animation: blink 1.5s infinite;
    }
    .online .status-dot  { background: #68d391; }
    .offline .status-dot { background: #fc8181; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* ── Tabs ── */
    .ai-tabs { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
    .ai-tab {
      flex: 1; min-width: 240px; display: flex; align-items: center; gap: 14px;
      padding: 18px 20px; border: 1.5px solid var(--c-gray200);
      background: white; border-radius: var(--r-lg); cursor: pointer;
      transition: all 0.2s; text-align: left;
      &:hover { border-color: var(--c-teal); background: var(--c-teal-lt); }
      &.active { border-color: var(--c-teal); background: var(--c-teal-lt); box-shadow: var(--sh-md); }
    }
    .at-icon-wrap {
      width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      svg { display: block; }
      &.absences { background: var(--c-teal-lt); color: var(--c-teal); }
      &.anomalies { background: var(--c-red-lt); color: var(--c-red); }
    }
    .at-tab:hover .at-icon-wrap, .at-tab.active .at-icon-wrap { opacity: 1; }
    .at-text { flex: 1; }
    .at-title { font-size: 14px; font-weight: 700; color: var(--c-text); display: block; margin-bottom: 2px; }
    .at-sub   { font-size: 11px; color: var(--c-muted); font-family: monospace; }
    .at-badge {
      margin-left: auto; padding: 4px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700; white-space: nowrap;
      &.warning { background: var(--c-amber-lt); color: var(--c-amber); }
      &.danger  { background: var(--c-red-lt);   color: var(--c-red); }
    }

    /* ── Loading ── */
    .ai-loading { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 14px; color: var(--c-muted); }
    .spin-wrap { svg { display: block; animation: spin 1s linear infinite; width: 40px; height: 40px; stroke: var(--c-teal); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Stats band ── */
    .stats-band { display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
    .sb-item { flex: 1; background: white; padding: 16px 20px; border-radius: var(--r); box-shadow: var(--sh); border: 1px solid var(--c-gray200); display: flex; flex-direction: column; gap: 4px; }
    .sb-val { font-size: 28px; font-weight: 800; color: var(--c-text); &.teal { color: var(--c-teal); } &.red { color: var(--c-red); } &.amber { color: var(--c-amber); } &.green { color: var(--c-green); } }
    .sb-label { font-size: 12px; color: var(--c-muted); }

    /* ── Model info ── */
    .model-info {
      display: flex; align-items: center; gap: 12px;
      background: var(--c-gray100); border-radius: var(--r);
      padding: 12px 16px; margin-bottom: 22px; font-size: 13px; color: var(--c-text);
      strong { color: var(--c-teal); }
    }
    .mi-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; svg { display: block; } &.teal { background: var(--c-teal-lt); color: var(--c-teal); } &.red { background: var(--c-red-lt); color: var(--c-red); } }
    .mi-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; flex-shrink: 0; background: var(--c-teal); color: white; &.red { background: var(--c-red); } }

    /* ── Predictions grid ── */
    .predictions-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }

    .pred-card {
      background: white; border-radius: var(--r-lg); padding: 0 18px 18px;
      box-shadow: var(--sh); border: 1px solid var(--c-gray200);
      transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;
      &:hover { transform: translateY(-3px); box-shadow: var(--sh-md); }
    }
    .pc-top-bar { height: 4px; margin: 0 -18px 16px; }
    .risk-eleve     .pc-top-bar { background: var(--c-red); }
    .risk-moyen     .pc-top-bar { background: var(--c-amber); }
    .risk-faible    .pc-top-bar { background: var(--c-teal); }
    .risk-tres_faible .pc-top-bar { background: var(--c-green); }

    .pc-header { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; flex-wrap: wrap; }
    .pc-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }
    .pc-info { flex: 1; strong { font-size: 13px; color: var(--c-text); } }
    .pc-risk-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; svg { display: block; } }
    .risk-eleve     .pc-risk-badge { background: var(--c-red-lt);   color: var(--c-red); }
    .risk-moyen     .pc-risk-badge { background: var(--c-amber-lt); color: var(--c-amber); }
    .risk-faible    .pc-risk-badge { background: var(--c-teal-lt);  color: var(--c-teal); }
    .risk-tres_faible .pc-risk-badge { background: var(--c-green-lt); color: var(--c-green); }

    .pc-proba { margin-bottom: 12px; }
    .pp-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-muted); margin-bottom: 5px; strong { font-size: 14px; font-weight: 800; } }
    .pp-track { height: 8px; background: var(--c-gray200); border-radius: 4px; overflow: hidden; }
    .pp-fill  { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
    .red   { color: var(--c-red)   !important; }
    .amber { color: var(--c-amber) !important; }
    .teal  { color: var(--c-teal)  !important; }
    .green { color: var(--c-green) !important; }
    .pp-fill.red   { background: var(--c-red); }
    .pp-fill.amber { background: var(--c-amber); }
    .pp-fill.teal  { background: var(--c-teal); }
    .pp-fill.green { background: var(--c-green); }

    .pc-factors { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; .pf-label { font-size: 10px; color: var(--c-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: 100%; } }
    .pf-tag { background: var(--c-gray100); color: var(--c-text); padding: 2px 9px; border-radius: 10px; font-size: 10px; }

    .pc-conseil { display: flex; align-items: flex-start; gap: 6px; font-size: 11px; color: var(--c-muted); background: var(--c-gray100); border-radius: 8px; padding: 7px 10px; line-height: 1.5; svg { display: block; flex-shrink: 0; margin-top: 1px; color: var(--c-amber); } }

    /* ── Anomalies list ── */
    .anomalies-list { display: flex; flex-direction: column; gap: 12px; }
    .anom-card { background: white; border-radius: var(--r-lg); padding: 18px 22px; box-shadow: var(--sh); border: 1px solid var(--c-gray200); position: relative; overflow: hidden; }
    .anom-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
    .niveau-critique  .anom-accent { background: var(--c-red); }
    .niveau-alerte    .anom-accent { background: var(--c-amber); }
    .niveau-attention .anom-accent { background: var(--c-teal); }
    .niveau-normal    .anom-accent { background: var(--c-green); }

    .ac-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .ac-left { display: flex; align-items: center; gap: 11px; .ac-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--c-teal), var(--c-teal-dk)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; } strong { font-size: 14px; color: var(--c-text); display: block; margin-bottom: 2px; } }
    .ac-score { font-size: 12px; color: var(--c-muted); strong { font-weight: 700; } }

    .niveau-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px; border-radius: 20px; font-size: 12px; font-weight: 700; svg { display: block; width: 13px; height: 13px; } }
    .critique  { background: var(--c-red-lt);   color: var(--c-red); }
    .alerte    { background: var(--c-amber-lt); color: var(--c-amber); }
    .attention { background: var(--c-teal-lt);  color: var(--c-teal); }
    .normal    { background: var(--c-green-lt); color: var(--c-green); }

    .score-bar-wrap { margin-bottom: 14px; }
    .score-track { height: 6px; background: var(--c-gray200); border-radius: 3px; overflow: hidden; }
    .score-fill  { height: 100%; border-radius: 3px; transition: width 0.8s ease; &.red { background: var(--c-red); } &.amber { background: var(--c-amber); } &.teal { background: var(--c-teal); } &.green { background: var(--c-green); } }

    .anom-detected { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
    .ad-item { display: flex; align-items: flex-start; gap: 9px; padding: 9px 12px; border-radius: var(--r); font-size: 12px; .ad-icon { flex-shrink: 0; svg { display: block; } } .ad-type { font-weight: 700; color: var(--c-text); display: inline; margin-right: 5px; } .ad-icon-type { display: inline-flex; vertical-align: middle; margin-right: 4px; svg { display: block; width: 11px; height: 11px; } } small { color: var(--c-muted); display: block; margin-top: 2px; } &.sev-haute   { background: #fff5f5; .ad-icon svg { stroke: var(--c-red); } } &.sev-moyenne { background: #fffff0; .ad-icon svg { stroke: var(--c-amber); } } }

    .anom-normal { display: flex; align-items: center; gap: 7px; color: var(--c-green); font-size: 13px; font-weight: 600; padding: 6px 0; svg { display: block; } }
    .anom-rec { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; color: var(--c-text); background: var(--c-gray100); border-radius: var(--r); padding: 9px 12px; margin-top: 8px; line-height: 1.5; svg { display: block; flex-shrink: 0; margin-top: 1px; color: var(--c-amber); } }

    /* ── Responsive ── */
    @media (max-width: 1024px) { .predictions-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 640px)  { .predictions-grid { grid-template-columns: 1fr; } }

    .fade-in { animation: fadeUp 0.22s ease both; }
    .tab-content { animation: fadeUp 0.2s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MlInsightsComponent implements OnInit {

  private mlService = inject(MlService);

  ic = IC;

  activeTab    = signal<Tab>('absences');
  loading      = signal(true);
  mlOnline     = signal(false);

  predictions  = signal<AbsencePrediction[]>([]);
  anomalies    = signal<AnomalyResult[]>([]);
  absenceStats = signal<any>(null);
  anomalyStats = signal<any>(null);

  ngOnInit(): void {
    this.checkHealth();
    this.loadData();
  }

  checkHealth(): void {
    this.mlService.getHealth().subscribe({
      next:  () => this.mlOnline.set(true),
      error: () => this.mlOnline.set(false)
    });
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      absences:  this.mlService.getPredictionsAbsences(),
      anomalies: this.mlService.getAnomalies()
    }).subscribe({
      next: (data) => {
        this.predictions.set(data.absences?.predictions ?? []);
        this.absenceStats.set(data.absences?.stats ?? null);
        this.anomalies.set(data.anomalies?.anomalies ?? []);
        this.anomalyStats.set(data.anomalies?.stats ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  getInitiales(nom: string): string {
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }

  getRiskClass(r: string): string { return 'risk-' + r.toLowerCase(); }

  getRiskDot(r: string): string {
    const map: Record<string, string> = {
      ELEVE: IC.dotRed, MOYEN: IC.dotAmber,
      FAIBLE: IC.dotTeal, TRES_FAIBLE: IC.dotGreen
    };
    return map[r] ?? IC.dotGreen;
  }

  getRiskLabel(r: string): string {
    const map: Record<string, string> = {
      ELEVE: 'Risque élevé', MOYEN: 'Risque moyen',
      FAIBLE: 'Risque faible', TRES_FAIBLE: 'Stable'
    };
    return map[r] ?? r;
  }

  getProbaColor(p: number): string {
    if (p >= 75) return 'red';
    if (p >= 50) return 'amber';
    if (p >= 25) return 'teal';
    return 'green';
  }

  getScoreColor(s: number): string {
    if (s >= 75) return 'red';
    if (s >= 50) return 'amber';
    if (s >= 25) return 'teal';
    return 'green';
  }

  getNiveauClass(n: string): string { return n.toLowerCase(); }

  getNiveauIconSvg(n: string): string {
    const map: Record<string, string> = {
      CRITIQUE:  IC.alert, ALERTE: IC.warning,
      ATTENTION: IC.eye,   NORMAL: IC.checkCircle
    };
    return map[n] ?? IC.warning;
  }

  getSeveriteIconSvg(s: string): string {
    return s === 'HAUTE' ? IC.alert : IC.warning;
  }

  getAnomalyTypeLabel(type: string): string {
    const map: Record<string, string> = {
      ABSENCES_EXCESSIVES:      'Absences excessives',
      AUTORISATIONS_FREQUENTES: 'Autorisations fréquentes',
      RECLAMATIONS_MULTIPLES:   'Réclamations multiples',
      AVANCES_REPETEES:         'Avances répétées',
      RETARDS_RETOUR:           'Retards au retour'
    };
    return map[type] ?? type;
  }

  getAnomalyTypeIconSvg(type: string): string {
    const map: Record<string, string> = {
      ABSENCES_EXCESSIVES:      IC.clock,
      AUTORISATIONS_FREQUENTES: IC.door,
      RECLAMATIONS_MULTIPLES:   IC.msgAlert,
      AVANCES_REPETEES:         IC.banknote,
      RETARDS_RETOUR:           IC.arrowReturn
    };
    return map[type] ?? IC.warning;
  }
}