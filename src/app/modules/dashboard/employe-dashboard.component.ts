import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-employe-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="emp-dash fade-in">

  <!-- ═══ HERO ═══ -->
  <div class="hero-band">
    <div class="hb-left">
      <div class="hb-avatar">{{ getInitiales() }}</div>
      <div>
        <p class="hb-greeting">{{ getGreeting() }}</p>
        <h1>{{ user()?.prenom }} {{ user()?.nom }}</h1>
        <p class="hb-sub">
          {{ user()?.poste }} — {{ user()?.departement }}
        </p>
      </div>
    </div>
    <div class="hb-date">
      <div class="hd-day">{{ today() | date:'d' }}</div>
      <div class="hd-month">
        {{ today() | date:'MMM yyyy' | uppercase }}
      </div>
    </div>
  </div>

  <!-- ═══ SOLDES ═══ -->
  <div class="soldes-section">
    <h2 class="section-title">Mes soldes de congés</h2>
    <div class="soldes-grid">

      <div class="solde-card" *ngFor="let s of getSoldes()">
        <div class="sc-top">
          <div class="sc-icon"
               [style.background]="s.bg"
               [style.color]="s.color">
            <svg width="16" height="16" fill="none"
                 stroke="currentColor" stroke-width="2"
                 viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="sc-meta">
            <span class="sc-label">{{ s.label }}</span>
            <span class="sc-fraction">
              <strong [style.color]="s.color">
                {{ s.restant }}
              </strong>
              <span> / {{ s.total }} jours</span>
            </span>
          </div>
          <div class="sc-circle">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none"
                      stroke="#e2e8f0" stroke-width="4"/>
              <circle cx="24" cy="24" r="20" fill="none"
                      [attr.stroke]="s.color"
                      stroke-width="4"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="125.6"
                      [attr.stroke-dashoffset]="
                        125.6 - (125.6 * s.pct / 100)"
                      transform="rotate(-90 24 24)"/>
              <text x="24" y="28" text-anchor="middle"
                    [attr.fill]="s.color"
                    font-size="13" font-weight="700"
                    font-family="inherit">
                {{ s.pct }}%
              </text>
            </svg>
          </div>
        </div>

        <!-- Barre de progression -->
        <div class="sc-bar-track">
          <div class="sc-bar-fill"
               [style.width]="s.pct + '%'"
               [style.background]="s.pct < 20
                 ? '#E24B4A' : s.color">
          </div>
        </div>

        <div class="sc-bottom">
          <span class="sc-used">{{ s.consomme }} utilisés</span>
          <span class="sc-warn" *ngIf="s.pct < 20">
            ⚠️ Solde faible
          </span>
          <span class="sc-ok" *ngIf="s.pct >= 20">
            {{ s.restant }} restants
          </span>
        </div>
      </div>

    </div>
  </div>

  <!-- ═══ GRILLE PRINCIPALE ═══ -->
  <div class="main-grid">

    <!-- Calendrier personnel -->
    <div class="cal-card">
      <div class="cal-head">
        <button class="cal-nav" (click)="prevMonth()">‹</button>
        <h3>{{ getMonthLabel() }}</h3>
        <button class="cal-nav" (click)="nextMonth()">›</button>
      </div>

      <!-- Légende -->
      <div class="cal-legend">
        <span class="cl-item">
          <span class="cl-dot" style="background:#0b6e7e"></span>
          Congé validé
        </span>
        <span class="cl-item">
          <span class="cl-dot" style="background:#EF9F27"></span>
          Jour férié
        </span>
        <span class="cl-item">
          <span class="cl-dot"
                style="background:#E24B4A;border-radius:50%">
          </span>
          Aujourd'hui
        </span>
        <span class="cl-item">
          <span class="cl-dot"
                style="background:#BEE3F8">
          </span>
          En attente
        </span>
      </div>

      <!-- Grille calendrier -->
      <div class="cal-grid">
        <div class="cal-dh"
             *ngFor="let j of joursTitles">{{ j }}</div>
        <div class="cal-empty"
             *ngFor="let _ of getEmptyCells()"></div>
        <div class="cal-day"
             *ngFor="let day of getDaysInMonth()"
             [class.today]="isToday(day)"
             [class.ferie]="isFerie(day)"
             [class.weekend]="isWeekend(day)"
             [class.has-conge]="hasCongeValide(day)"
             [class.has-attente]="hasCongeAttente(day)"
             [title]="getDayTitle(day)">
          <span class="cal-num">{{ day | date:'d' }}</span>
          <!-- Indicateur congé validé -->
          <div class="day-dot conge-dot"
               *ngIf="hasCongeValide(day)">
          </div>
          <!-- Indicateur en attente -->
          <div class="day-dot attente-dot"
               *ngIf="hasCongeAttente(day)
                      && !hasCongeValide(day)">
          </div>
          <!-- Label férié -->
          <div class="ferie-label"
               *ngIf="isFerie(day)">
            {{ getFerieLabel(day) }}
          </div>
        </div>
      </div>

      <!-- Prochain congé -->
      <div class="upcoming-conges"
           *ngIf="getProchainConge()">
        <div class="uc-item">
          <div class="uc-icon">📅</div>
          <div>
            <span class="uc-label">Prochain congé</span>
            <span class="uc-val">
              {{ getProchainConge()?.dateDebut
                 | date:'dd/MM/yyyy' }}
              →
              {{ getProchainConge()?.dateFin
                 | date:'dd/MM/yyyy' }}
            </span>
          </div>
          <span class="uc-badge"
                [class]="getStatutClass(
                  getProchainConge()?.statut)">
            {{ getStatutLabel(getProchainConge()?.statut) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Panneau droite -->
    <div class="right-panel">

      <!-- Dernières demandes -->
      <div class="panel-card">
        <div class="pc-head">
          <h3>Mes dernières demandes</h3>
          <a routerLink="/conges" class="pc-link">
            Voir tout →
          </a>
        </div>
        <div class="requests-list">
          <div class="req-item"
               *ngFor="let r of getRecentRequests()">
            <div class="req-icon">{{ r.emoji }}</div>
            <div class="req-info">
              <span class="req-label">{{ r.label }}</span>
              <span class="req-date">
                {{ r.date | date:'dd/MM/yyyy' }}
                <span class="req-days"
                      *ngIf="r.jours">
                  • {{ r.jours }} jour(s)
                </span>
              </span>
            </div>
            <span class="req-statut"
                  [class]="getStatutClass(r.statut)">
              {{ getStatutLabel(r.statut) }}
            </span>
          </div>
          <div class="req-empty"
               *ngIf="getRecentRequests().length === 0">
            Aucune demande récente
          </div>
        </div>
      </div>

      <!-- Accès rapide -->
      <div class="panel-card">
        <h3 style="font-size:14px;font-weight:700;
                   margin-bottom:12px">
          Accès rapide
        </h3>
        <div class="quick-grid">
          <a routerLink="/conges"
             class="quick-btn qb-teal">
            <svg width="16" height="16" fill="none"
                 stroke="currentColor" stroke-width="2"
                 viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Demande de congé
          </a>
          <a routerLink="/autorisations"
             class="quick-btn qb-blue">
            <svg width="16" height="16" fill="none"
                 stroke="currentColor" stroke-width="2"
                 viewBox="0 0 24 24">
              <path d="M13 4H6a2 2 0 0 0-2 2v12
                       a2 2 0 0 0 2 2h7"/>
              <polyline points="17 8 21 12 17 16"/>
              <line x1="21" y1="12" x2="10" y2="12"/>
            </svg>
            Autorisation de sortie
          </a>
          <a routerLink="/avances"
             class="quick-btn qb-green">
            <svg width="16" height="16" fill="none"
                 stroke="currentColor" stroke-width="2"
                 viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <circle cx="12" cy="12" r="2.5"/>
            </svg>
            Avance sur salaire
          </a>
          <a routerLink="/reclamations"
             class="quick-btn qb-amber">
            <svg width="16" height="16" fill="none"
                 stroke="currentColor" stroke-width="2"
                 viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4
                       V5a2 2 0 0 1 2-2h14
                       a2 2 0 0 1 2 2z"/>
            </svg>
            Réclamation
          </a>
        </div>
      </div>

      <!-- Alerte solde faible -->
      <div class="alert-card" *ngIf="hasSoldeFaible()">
        <div class="alert-icon">⚠️</div>
        <div>
          <strong>Solde faible</strong>
          <p>Un ou plusieurs de vos soldes de congés
             sont presque épuisés.</p>
        </div>
      </div>

    </div>
  </div>

</div>
  `,
  styles: [`
    :host {
      --primary:   #0b6e7e;
      --secondary: #12b5c4;
      --accent:    #e0f7fa;
      --text:      #0f172a;
      --muted:     #64748b;
      --border:    #e2e8f0;
      --bg:        #f8fafc;
      --r:         10px;
      --r-lg:      16px;
    }

    .emp-dash { max-width: 100%; padding-bottom: 48px; }

    /* ── Hero ── */
    .hero-band {
      background: linear-gradient(135deg, #0b6e7e, #12b5c4);
      border-radius: 20px; padding: 22px 26px;
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 22px; flex-wrap: wrap; gap: 12px;
    }
    .hb-left { display: flex; align-items: center; gap: 14px; }
    .hb-avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: rgba(255,255,255,0.2); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; flex-shrink: 0;
    }
    .hb-greeting { font-size: 12px; color: rgba(255,255,255,0.65); margin: 0 0 3px; }
    .hero-band h1 { font-size: 20px; font-weight: 800; color: white; margin: 0 0 3px; }
    .hb-sub { font-size: 12px; color: rgba(255,255,255,0.6); margin: 0; }
    .hb-date { text-align: center; }
    .hd-day   { font-size: 40px; font-weight: 900; color: white; line-height: 1; }
    .hd-month { font-size: 12px; color: rgba(255,255,255,0.65);
                text-transform: uppercase; letter-spacing: 1px; }

    /* ── Section title ── */
    .section-title {
      font-size: 16px; font-weight: 700; color: var(--text);
      margin-bottom: 14px;
    }

    /* ── Soldes ── */
    .soldes-section { margin-bottom: 22px; }
    .soldes-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 14px;
      @media (max-width: 800px) { grid-template-columns: 1fr; }
    }

    .solde-card {
      background: white; border-radius: var(--r-lg); padding: 16px;
      border: 1px solid var(--border); transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }

    .sc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .sc-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sc-meta { flex: 1; }
    .sc-label {
      display: block; font-size: 11px; font-weight: 700;
      color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px;
    }
    .sc-fraction {
      display: block; font-size: 13px; color: var(--muted); margin-top: 2px;
    }
    .sc-fraction strong { font-size: 18px; font-weight: 800; }

    .sc-bar-track {
      height: 8px; background: #e2e8f0; border-radius: 4px;
      overflow: hidden; margin-bottom: 8px;
    }
    .sc-bar-fill {
      height: 100%; border-radius: 4px;
      transition: width 1s cubic-bezier(0.34,1.56,0.64,1);
    }

    .sc-bottom { display: flex; justify-content: space-between; align-items: center; }
    .sc-used { font-size: 11px; color: var(--muted); }
    .sc-warn {
      font-size: 11px; font-weight: 600; color: #A32D2D;
      background: #FCEBEB; padding: 2px 7px; border-radius: 4px;
    }
    .sc-ok { font-size: 11px; font-weight: 600; color: #3B6D11; }

    /* ── Main grid ── */
    .main-grid {
      display: grid; grid-template-columns: 340px 1fr;
      gap: 16px; align-items: start;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    /* ── Calendrier ── */
    .cal-card {
      background: white; border-radius: var(--r-lg); padding: 18px;
      border: 1px solid var(--border);
    }
    .cal-head {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 12px;
    }
    .cal-head h3 {
      font-size: 14px; font-weight: 700; color: var(--text);
    }
    .cal-nav {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid var(--border); background: white;
      cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); transition: all 0.2s;
      &:hover {
        background: var(--accent); color: var(--primary);
        border-color: var(--primary);
      }
    }

    .cal-legend {
      display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .cl-item {
      display: flex; align-items: center; gap: 5px;
      font-size: 10px; color: var(--muted);
    }
    .cl-dot {
      width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0;
    }

    .cal-grid {
      display: grid; grid-template-columns: repeat(7,1fr); gap: 2px;
    }
    .cal-dh {
      text-align: center; font-size: 10px; font-weight: 700;
      color: var(--muted); padding: 4px 0; text-transform: uppercase;
    }

    /* ── Cellules calendrier ── */
    .cal-day {
      min-height: 42px; border-radius: 6px; padding: 4px;
      display: flex; flex-direction: column; align-items: center;
      position: relative; cursor: default; transition: background 0.15s;

      &:hover { background: var(--bg); }

      /* Aujourd'hui */
      &.today {
        background: #FEF3C7;
        .cal-num { color: #92400E; font-weight: 800; }
      }

      /* Jour férié — orange/jaune */
      &.ferie {
        background: #FEF3C7;
        border: 1.5px solid #F59E0B;
        .cal-num { color: #92400E; font-weight: 700; }
      }

      /* Congé validé — bleu pétrole */
      &.has-conge {
        background: #CFFAFE;
        border: 1.5px solid #0b6e7e;
        .cal-num { color: #0b6e7e; font-weight: 700; }
      }

      /* Congé en attente — bleu clair */
      &.has-attente {
        background: #EFF6FF;
        border: 1.5px solid #93C5FD;
        .cal-num { color: #1D4ED8; font-weight: 700; }
      }

      /* Weekend */
      &.weekend { opacity: 0.45; }
    }

    .cal-num { font-size: 12px; font-weight: 500; color: var(--text); }

    /* Petits points sous le numéro */
    .day-dot {
      width: 5px; height: 5px; border-radius: 50%; margin-top: 2px;
    }
    .conge-dot   { background: #0b6e7e; }
    .attente-dot { background: #3B82F6; }

    /* Label férié petit texte */
    .ferie-label {
      font-size: 7px; color: #92400E; font-weight: 600;
      text-align: center; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
      max-width: 100%; line-height: 1.2; margin-top: 1px;
    }

    .upcoming-conges {
      margin-top: 12px; padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    .uc-item { display: flex; align-items: center; gap: 10px; }
    .uc-icon { font-size: 18px; }
    .uc-label { display: block; font-size: 11px; color: var(--muted); }
    .uc-val   { display: block; font-size: 12px; font-weight: 600; color: var(--text); }
    .uc-badge {
      margin-left: auto; font-size: 10px; font-weight: 600;
      padding: 2px 8px; border-radius: 10px; white-space: nowrap;
    }

    /* ── Right panel ── */
    .right-panel { display: flex; flex-direction: column; gap: 14px; }
    .panel-card {
      background: white; border-radius: var(--r-lg); padding: 16px;
      border: 1px solid var(--border);
    }
    .pc-head {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 12px;
    }
    .pc-head h3 { font-size: 14px; font-weight: 700; color: var(--text); }
    .pc-link {
      font-size: 12px; color: var(--primary);
      text-decoration: none; font-weight: 600;
      &:hover { text-decoration: underline; }
    }

    /* Requests */
    .requests-list { display: flex; flex-direction: column; gap: 8px; }
    .req-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      &:last-child { border-bottom: none; }
    }
    .req-icon { font-size: 18px; }
    .req-info { flex: 1; }
    .req-label { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
    .req-date  { display: block; font-size: 11px; color: var(--muted); }
    .req-days  { color: var(--primary); font-weight: 600; }

    .req-statut {
      font-size: 10px; font-weight: 700; padding: 3px 8px;
      border-radius: 8px; white-space: nowrap;
    }
    .st-attente { background: #FAEEDA; color: #633806; }
    .st-validee { background: #EAF3DE; color: #3B6D11; }
    .st-rejetee { background: #FCEBEB; color: #791F1F; }

    .req-empty {
      font-size: 13px; color: var(--muted);
      padding: 12px 0; text-align: center;
    }

    /* Quick access */
    .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .quick-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-radius: var(--r);
      text-decoration: none; font-size: 12px; font-weight: 600;
      transition: all 0.2s;
      &:hover { opacity: 0.85; transform: translateY(-1px); }
    }
    .qb-teal  { background: var(--accent); color: var(--primary); }
    .qb-blue  { background: #E6F1FB; color: #185FA5; }
    .qb-green { background: #EAF3DE; color: #3B6D11; }
    .qb-amber { background: #FAEEDA; color: #633806; }

    /* Alert */
    .alert-card {
      display: flex; align-items: flex-start; gap: 12px;
      background: #FAEEDA; border-radius: var(--r-lg);
      padding: 14px 16px; border: 1px solid #EF9F27;
    }
    .alert-icon { font-size: 20px; flex-shrink: 0; }
    .alert-card strong { display: block; font-size: 13px; color: #633806; margin-bottom: 3px; }
    .alert-card p { font-size: 12px; color: #854F0B; margin: 0; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeUp 0.3s ease; }
  `]
})
export class EmployeDashboardComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  user        = signal<any>(null);
  conges      = signal<any[]>([]);
  soldes      = signal<any>(null);
  currentDate = signal(new Date());

  // ✅ Map date → label du jour férié
  feriesMap   = signal<Map<string, string>>(new Map());

  joursTitles = ['L','M','M','J','V','S','D'];

  ngOnInit(): void {
    const stored = JSON.parse(
      localStorage.getItem('rh_user') ?? '{}');
    this.user.set(stored);

    forkJoin({
      conges: this.http.get<any[]>(
        `${this.API}/employe/conges`),
      profil: this.http.get<any>(
        `${this.API}/employe/profil`),
      feries: this.http.get<any[]>(
        `${this.API}/employe/conges/jours-feries`)
    }).subscribe({
      next: (d) => {
        this.conges.set(d.conges ?? []);
        this.soldes.set(d.profil ?? null);

        if (d.profil) {
          this.user.update(u => ({ ...u, ...d.profil }));
        }

        // ✅ Construire la map { "2026-01-01" → "Nouvel An" }
        const map = new Map<string, string>();

        (d.feries ?? []).forEach((f: any) => {
          // Backend retourne soit un objet { date, label }
          // soit directement une string
          let dateKey = '';
          let label   = '';

          if (typeof f === 'string') {
            dateKey = f.substring(0, 10);
            label   = 'Jour férié';
          } else {
            // Normaliser la date sans fuseau
            const raw = f.date ?? f.configKey ?? '';
            dateKey = raw.substring(0, 10);
            label   = f.label ?? f.configValue ?? 'Jour férié';
          }

          if (dateKey) map.set(dateKey, label);
        });

        this.feriesMap.set(map);
        console.log('✅ Jours fériés chargés:',
          [...map.entries()]);
      },
      error: (err) => {
        console.error('Erreur dashboard:', err);
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // SOLDES — lire depuis le profil
  // ═══════════════════════════════════════════════════

  getSoldes() {
    const s = this.soldes();

    // ✅ Lire les totaux depuis le profil (configurés en admin)
    const totalA = s?.soldeCongesAnnuelTotal    ?? 21;
    const totalM = s?.soldeCongesMaladieTotal   ?? 6;
    const totalE = s?.soldeCongesExceptionTotal ?? 3;

    // ✅ Lire les restants calculés côté backend
    const restA = s?.soldeCongesAnnuelRestant    ?? totalA;
    const restM = s?.soldeCongesMaladieRestant   ?? totalM;
    const restE = s?.soldeCongesExceptionRestant ?? totalE;

    const calcPct = (rest: number, total: number) =>
      total > 0 ? Math.round(rest / total * 100) : 0;

    return [
      {
        label:    'Annuel',
        total:    totalA,
        restant:  restA,
        consomme: totalA - restA,
        pct:      calcPct(restA, totalA),
        bg:       '#E6F1FB',
        color:    '#185FA5'
      },
      {
        label:    'Maladie',
        total:    totalM,
        restant:  restM,
        consomme: totalM - restM,
        pct:      calcPct(restM, totalM),
        bg:       '#EAF3DE',
        color:    '#3B6D11'
      },
      {
        label:    'Exceptionnel',
        total:    totalE,
        restant:  restE,
        consomme: totalE - restE,
        pct:      calcPct(restE, totalE),
        bg:       '#FAEEDA',
        color:    '#633806'
      }
    ];
  }

  hasSoldeFaible(): boolean {
    return this.getSoldes().some(s => s.pct < 20);
  }

  // ═══════════════════════════════════════════════════
  // DEMANDES RÉCENTES
  // ═══════════════════════════════════════════════════

  getRecentRequests(): any[] {
    return this.conges().slice(0, 5).map(c => ({
      emoji: '📅',
      label: `Congé ${(c.typeConge ?? 'Annuel').toLowerCase()}`,
      date:  c.createdAt ?? c.dateDebut,
      jours: c.nombreJours,
      statut: c.statut
    }));
  }

  getProchainConge(): any {
    const now = new Date();
    return this.conges().find(c =>
      ['VALIDEE', 'EN_ATTENTE_MANAGER', 'EN_ATTENTE_RH']
        .includes(c.statut) &&
      new Date(c.dateDebut) >= now
    ) ?? null;
  }

  // ═══════════════════════════════════════════════════
  // CALENDRIER
  // ═══════════════════════════════════════════════════

  getDaysInMonth(): Date[] {
    const d  = this.currentDate();
    const nb = new Date(
      d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return Array.from({ length: nb },
      (_, i) => new Date(d.getFullYear(), d.getMonth(), i + 1)
    );
  }

  getEmptyCells(): any[] {
    const d     = this.currentDate();
    let first   = new Date(
      d.getFullYear(), d.getMonth(), 1).getDay();
    first = first === 0 ? 6 : first - 1;
    return Array(first).fill(null);
  }

  prevMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  getMonthLabel(): string {
    return this.currentDate().toLocaleDateString('fr-FR', {
      month: 'long', year: 'numeric'
    });
  }

  isToday(d: Date): boolean {
    const t = new Date();
    return d.getDate()     === t.getDate() &&
           d.getMonth()    === t.getMonth() &&
           d.getFullYear() === t.getFullYear();
  }

  isWeekend(d: Date): boolean {
    return d.getDay() === 0 || d.getDay() === 6;
  }

  // ✅ Vérifier jour férié avec la Map
  isFerie(d: Date): boolean {
    const key = this.toDateKey(d);
    return this.feriesMap().has(key);
  }

  // ✅ Récupérer le label du jour férié
  getFerieLabel(d: Date): string {
    const key   = this.toDateKey(d);
    const label = this.feriesMap().get(key) ?? '';
    // Tronquer si trop long pour la cellule
    return label.length > 8
      ? label.substring(0, 7) + '…'
      : label;
  }

  // ✅ Congé VALIDÉ sur ce jour
  hasCongeValide(day: Date): boolean {
    return this.conges().some(c => {
      if (c.statut !== 'VALIDEE') return false;
      return this.dayInRange(day, c.dateDebut, c.dateFin);
    });
  }

  // ✅ Congé EN ATTENTE sur ce jour
  hasCongeAttente(day: Date): boolean {
    return this.conges().some(c => {
      if (!c.statut?.includes('ATTENTE')) return false;
      return this.dayInRange(day, c.dateDebut, c.dateFin);
    });
  }

  // Titre au survol
  getDayTitle(d: Date): string {
    const key    = this.toDateKey(d);
    const ferie  = this.feriesMap().get(key);
    const conge  = this.conges().find(c =>
      ['VALIDEE', 'EN_ATTENTE_MANAGER', 'EN_ATTENTE_RH']
        .includes(c.statut) &&
      this.dayInRange(d, c.dateDebut, c.dateFin)
    );

    const parts: string[] = [];
    if (ferie) parts.push(`🗓️ ${ferie}`);
    if (conge) parts.push(
      `📅 Congé ${conge.typeConge} (${conge.statut})`);

    return parts.join('\n') || '';
  }

  // ─── Helpers ───────────────────────────────────────

  // ✅ Convertir Date en "YYYY-MM-DD" sans décalage fuseau
  private toDateKey(d: Date): string {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ✅ Vérifier si un jour est dans une plage de congé
  private dayInRange(
      day: Date,
      startStr: string,
      endStr: string): boolean {

    const start = new Date(startStr);
    const end   = new Date(endStr);

    // Normaliser à minuit/23h59 pour éviter problèmes fuseau
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const d = new Date(day);
    d.setHours(12, 0, 0, 0);

    return d >= start && d <= end;
  }

  getInitiales(): string {
    const u = this.user();
    return ((u?.prenom?.[0] ?? '') +
            (u?.nom?.[0]   ?? '')).toUpperCase();
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getStatutClass(s: string): string {
    if (!s) return 'st-attente';
    if (s.includes('ATTENTE')) return 'st-attente';
    if (s === 'VALIDEE') return 'st-validee';
    return 'st-rejetee';
  }

  getStatutLabel(s: string): string {
    const map: Record<string,string> = {
      EN_ATTENTE_MANAGER: '⏳ Att. Manager',
      EN_ATTENTE_RH:      '⏳ Att. RH',
      VALIDEE:            '✅ Validé',
      REJETEE:            '❌ Refusé'
    };
    return map[s] ?? s;
  }

  today(): Date { return new Date(); }
}