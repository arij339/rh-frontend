import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { SafeHtmlPipe }  from '../../../shared/pipes/safe-html.pipe';

const ICONS: Record<string, string> = {
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>`,
  flag:     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  trash:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  plus:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  save:     `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  empty:    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

type Tab = 'CONGES' | 'JOURS_FERIES';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [FormsModule, SafeHtmlPipe],
  template: `
  <div class="admin-config fade-in">

    <!-- ── Header ──────────────────────────────────────── -->
    <div class="page-header">
      <div class="header-icon" [innerHTML]="ic['settings'] | safeHtml"></div>
      <div>
        <h1>Configuration du Système</h1>
        <p>Paramétrez les règles de congés et gérez le calendrier des jours fériés.</p>
      </div>
    </div>

    <!-- ── Tabs ─────────────────────────────────────────── -->
    <div class="cfg-tabs">
      @for (t of tabs; track t.key) {
        <button class="ct" [class.active]="activeTab() === t.key"
                (click)="activeTab.set(t.key)">
          <span class="tab-icon" [innerHTML]="ic[t.icon] | safeHtml"></span>
          {{ t.label }}
        </button>
      }
    </div>

    <!-- ===== CONGÉS & RÈGLES ================================ -->
    @if (activeTab() === 'CONGES') {
      <div class="cfg-panel fade-in">
        <div class="panel-head">
          <div class="ph-icon" [innerHTML]="ic['calendar'] | safeHtml"></div>
          <div>
            <h2>Règles de gestion des congés</h2>
            <p>Ces paramètres sont appliqués automatiquement à chaque demande de congé.</p>
          </div>
        </div>

        <!-- Bannière d'info -->
        <div class="info-banner">
          <span [innerHTML]="ic['check'] | safeHtml"></span>
          <div>
            <strong>Paramètres actifs</strong>
            <p>Les valeurs ci-dessous sont lues par le système à chaque nouvelle demande.
               Toute modification est prise en compte immédiatement, sans redémarrage.</p>
          </div>
        </div>

        <div class="cfg-grid">
          @for (item of congesItems(); track item.key) {
            <div class="cfg-field">
              <label>{{ item.description }}</label>
              <div class="field-hint">Clé : <code>{{ item.key }}</code></div>
              @if (item.type === 'BOOLEAN') {
                <div class="toggle-row" (click)="toggleBool(item)">
                  <div class="toggle" [class.on]="item.val === 'true'">
                    <div class="tknob"></div>
                  </div>
                  <span class="toggle-label">
                    {{ item.val === 'true' ? 'Activé' : 'Désactivé' }}
                  </span>
                </div>
              } @else {
                <div class="input-row">
                  <input type="number"
                         [(ngModel)]="item.val"
                         class="cfg-input"
                         min="0" />
                  <span class="unit">jours</span>
                  <button class="btn-save" (click)="save(item.key, item.val)"
                          title="Sauvegarder">
                    <span [innerHTML]="ic['save'] | safeHtml"></span>
                    Sauvegarder
                  </button>
                </div>
              }
            </div>
          }
          @if (congesItems().length === 0) {
            <div class="empty-state" style="grid-column:1/-1">
              <span [innerHTML]="ic['empty'] | safeHtml"></span>
              <p>Aucun paramètre de congé trouvé en base de données.</p>
              <small>Vérifiez que la table system_config a été initialisée.</small>
            </div>
          }
        </div>

        <!-- Tableau récapitulatif des règles actives -->
        <div class="rules-summary">
          <h3>Résumé des règles actuellement actives</h3>
          <div class="rules-grid">
            <div class="rule-card">
              <div class="rule-val">{{ getVal('conges.preavis.jours') }}</div>
              <div class="rule-label">jours de préavis minimum</div>
              <div class="rule-desc">L'employé doit soumettre sa demande au moins N jours avant la date de départ.</div>
            </div>
            <div class="rule-card">
              <div class="rule-val">{{ getVal('conges.annuel.max') }}</div>
              <div class="rule-label">jours maximum consécutifs</div>
              <div class="rule-desc">Durée maximale autorisée pour une seule demande de congé annuel.</div>
            </div>
            <div class="rule-card">
              <div class="rule-val">{{ getVal('conges.report.actif') === 'true' ? '✓' : '✗' }}</div>
              <div class="rule-label">report de solde en fin d'année</div>
              <div class="rule-desc">Si activé, les jours non consommés sont reportés à l'année suivante.</div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ===== JOURS FÉRIÉS =================================== -->
    @if (activeTab() === 'JOURS_FERIES') {
      <div class="cfg-panel fade-in">
        <div class="panel-head">
          <div class="ph-icon" [innerHTML]="ic['flag'] | safeHtml"></div>
          <div>
            <h2>Calendrier des jours fériés</h2>
            <p>Ces jours sont exclus du calcul des jours ouvrables pour toutes les demandes de congé.</p>
          </div>
        </div>

        <!-- Bannière d'info -->
        <div class="info-banner">
          <span [innerHTML]="ic['check'] | safeHtml"></span>
          <div>
            <strong>Impact direct sur les congés</strong>
            <p>Chaque jour férié ajouté ici est automatiquement exclu du décompte
               des jours ouvrables lors du calcul d'une demande de congé.</p>
          </div>
        </div>

        <!-- Sélecteur d'année pour les boutons rapides -->
        <div class="year-selector-row">
          <span class="preset-label">Année :</span>
          @for (y of anneesDisponibles; track y) {
            <button class="year-btn" [class.active]="anneeCourante === y"
                    (click)="anneeCourante = y">{{ y }}</button>
          }
          <span class="year-hint">
            💡 Sélectionnez l'année avant d'ajouter les fériés
          </span>
        </div>

        <!-- Boutons rapides : fériés civils -->
        <div class="preset-section">
          <div class="preset-section-label">🏛️ Fériés civils (dates fixes)</div>
          <div class="preset-chips">
            @for (p of presetsCivils; track p.label) {
              <button class="preset-btn"
                      [class.already]="isAlreadyAdded(p.date)"
                      (click)="addPreset(p)"
                      [title]="isAlreadyAdded(p.date) ? 'Déjà ajouté' : 'Ajouter ' + p.nom">
                {{ p.label }}
                @if (isAlreadyAdded(p.date)) { <span class="preset-check">✓</span> }
              </button>
            }
          </div>
        </div>

        <!-- Boutons rapides : fêtes islamiques -->
        <div class="preset-section">
          <div class="preset-section-label">☪️ Fêtes islamiques {{ anneeCourante }} (calendrier lunaire)</div>
          @if (presetsIslamiques.length > 0) {
            <div class="preset-chips">
              @for (p of presetsIslamiques; track p.label) {
                <button class="preset-btn preset-btn-islamic"
                        [class.already]="isAlreadyAdded(p.date)"
                        (click)="addPreset(p)"
                        [title]="isAlreadyAdded(p.date) ? 'Déjà ajouté' : 'Ajouter ' + p.nom">
                  {{ p.label }}
                  @if (isAlreadyAdded(p.date)) { <span class="preset-check">✓</span> }
                </button>
              }
            </div>
          } @else {
            <p class="no-islamic">
              Dates islamiques non disponibles pour {{ anneeCourante }}.
              Utilisez le formulaire manuel ci-dessous.
            </p>
          }
        </div>

        <!-- Formulaire ajout manuel -->
        <div class="add-ferie">
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="newDate" class="cfg-input" />
          </div>
          <div class="form-group" style="flex:2">
            <label>Libellé</label>
            <input type="text" [(ngModel)]="newLabel"
                   placeholder="Ex: Fête du Travail" class="cfg-input" />
          </div>
          <button class="btn btn-primary" (click)="addFerie()"
                  [disabled]="!newDate || !newLabel">
            <span [innerHTML]="ic['plus'] | safeHtml"></span>
            Ajouter
          </button>
        </div>

        <!-- Table des jours fériés -->
        <div class="feries-table">
          <table class="pro-table">
            <thead>
              <tr><th>#</th><th>Date</th><th>Libellé</th><th>Action</th></tr>
            </thead>
            <tbody>
              @for (f of feries(); track f.id; let i = $index) {
                <tr>
                  <td class="num-col">{{ i + 1 }}</td>
                  <td>
                    <div class="date-cell">
                      <span class="dc-icon" [innerHTML]="ic['calendar'] | safeHtml"></span>
                      <strong>{{ formatDate(f.date) }}</strong>
                    </div>
                  </td>
                  <td>{{ f.label }}</td>
                  <td>
                    <button class="act-btn" (click)="delFerie(f.id)"
                            title="Supprimer ce jour férié"
                            [innerHTML]="ic['trash'] | safeHtml">
                    </button>
                  </td>
                </tr>
              }
              @if (feries().length === 0) {
                <tr>
                  <td colspan="4" class="empty-row">
                    <div class="empty-content">
                      <span [innerHTML]="ic['empty'] | safeHtml"></span>
                      <p>Aucun jour férié configuré</p>
                      <small>Utilisez les boutons ci-dessus pour ajouter les fériés tunisiens rapidement</small>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          @if (feries().length > 0) {
            <div class="table-foot">
              {{ feries().length }} jour(s) férié(s) — exclu(s) du calcul des congés
            </div>
          }
        </div>
      </div>
    }

    <!-- ── Toast ─────────────────────────────────────────── -->
    @if (toast().show) {
      <div class="saved-toast" [class]="'toast-' + toast().type">
        <span [innerHTML]="ic[toast().type === 'success' ? 'check' : 'flag'] | safeHtml"></span>
        {{ toast().message }}
      </div>
    }

  </div>
  `,
  styles: [`
    .admin-config { padding: 24px; max-width: 900px; }

    .page-header {
      display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
      h1 { font-size: 22px; font-weight: 700; color: var(--text); margin: 0 0 4px; }
      p  { font-size: 13px; color: var(--text-light); margin: 0; }
    }
    .header-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      color: white; flex-shrink: 0;
    }

    .cfg-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px; }
    .ct {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 18px; border-radius: 10px; border: 1.5px solid var(--gray-mid);
      background: white; font-size: 13px; font-weight: 500;
      color: var(--text-light); cursor: pointer;
      transition: all 0.15s ease;
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active {
        background: var(--primary); border-color: var(--primary);
        color: white;
        .tab-icon { color: white; }
      }
    }
    .tab-icon { display: flex; align-items: center; }

    .cfg-panel {
      background: white; border-radius: 16px;
      border: 1px solid var(--gray-mid);
      overflow: hidden;
    }

    .panel-head {
      display: flex; align-items: center; gap: 16px;
      padding: 20px 24px; border-bottom: 1px solid var(--gray-light);
      h2 { font-size: 16px; font-weight: 700; color: var(--text); margin: 0 0 3px; }
      p  { font-size: 12px; color: var(--text-light); margin: 0; }
    }
    .ph-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: var(--accent); display: flex; align-items: center;
      justify-content: center; color: var(--primary); flex-shrink: 0;
    }

    /* Info banner */
    .info-banner {
      display: flex; align-items: flex-start; gap: 14px;
      margin: 20px 24px 0; padding: 14px 18px;
      background: #EFF6FF; border-radius: 10px;
      border-left: 4px solid var(--primary);
      color: var(--primary);
      strong { font-size: 13px; display: block; margin-bottom: 3px; }
      p { font-size: 12px; color: var(--text); margin: 0; }
    }

    /* Config fields */
    .cfg-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px; padding: 24px;
    }
    .cfg-field {
      display: flex; flex-direction: column; gap: 8px;
      label { font-size: 13px; font-weight: 600; color: var(--text); }
    }
    .field-hint { font-size: 11px; color: var(--text-light); code { font-size: 10px; } }
    .cfg-input {
      width: 100%; padding: 10px 12px; border-radius: 8px;
      border: 1.5px solid var(--gray-mid); font-size: 13px;
      transition: border-color 0.15s;
      &:focus { border-color: var(--primary); outline: none; }
    }
    .input-row { display: flex; align-items: center; gap: 8px; }
    .unit { font-size: 12px; color: var(--text-light); white-space: nowrap; }
    .btn-save {
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
      padding: 8px 14px; border-radius: 8px; border: none;
      background: var(--primary); color: white; font-size: 12px;
      font-weight: 600; cursor: pointer;
      &:hover { opacity: 0.88; }
    }

    /* Toggle */
    .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .toggle {
      width: 44px; height: 24px; border-radius: 12px; background: var(--gray-mid);
      position: relative; transition: background 0.2s; flex-shrink: 0;
      &.on { background: var(--primary); }
    }
    .tknob {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%; background: white;
      transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      .toggle.on & { transform: translateX(20px); }
    }
    .toggle-label { font-size: 13px; color: var(--text); }

    /* Rules summary */
    .rules-summary {
      padding: 0 24px 24px;
      h3 { font-size: 13px; font-weight: 700; color: var(--text-light);
           text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 14px; }
    }
    .rules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .rule-card {
      background: var(--gray-light); border-radius: 12px; padding: 16px;
      text-align: center;
      .rule-val  { font-size: 28px; font-weight: 800; color: var(--primary); }
      .rule-label{ font-size: 11px; font-weight: 600; color: var(--text);
                   margin: 4px 0; text-transform: uppercase; letter-spacing: 0.3px; }
      .rule-desc { font-size: 11px; color: var(--text-light); line-height: 1.4; }
    }

    /* Jours fériés */
    .year-selector-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 16px 24px 4px;
    }
    .year-btn {
      padding: 5px 14px; border-radius: 20px; border: 1.5px solid var(--gray-mid);
      background: white; font-size: 12px; font-weight: 600; cursor: pointer;
      color: var(--text-light); transition: all 0.15s;
      &.active { background: var(--primary); color: white; border-color: var(--primary); }
      &:hover:not(.active) { border-color: var(--primary); color: var(--primary); }
    }
    .year-hint { font-size: 11px; color: var(--text-light); font-style: italic; }
    .preset-label { font-size: 12px; font-weight: 600; color: var(--text-light); }

    .preset-section {
      padding: 10px 24px 4px;
    }
    .preset-section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-light); margin-bottom: 8px;
    }
    .preset-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .no-islamic { font-size: 12px; color: var(--text-light); font-style: italic; margin: 4px 0; }

    .preset-btn {
      padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
      border: 1.5px solid var(--gray-mid); background: white; cursor: pointer;
      color: var(--text); transition: all 0.15s;
      &:hover:not(.already) { border-color: var(--primary); color: var(--primary); }
      &.already { background: #F0FDF4; border-color: #16A34A; color: #16A34A; }
      &.preset-btn-islamic:hover:not(.already) { border-color: #7C3AED; color: #7C3AED; }
    }
    .preset-check { margin-left: 4px; }

    .add-ferie {
      display: flex; align-items: flex-end; gap: 12px;
      padding: 0 24px 20px;
    }
    .form-group {
      display: flex; flex-direction: column; gap: 6px; flex: 1;
      label { font-size: 12px; font-weight: 600; color: var(--text); text-transform: uppercase; letter-spacing: 0.4px; }
    }
    .btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px;
           border-radius: 10px; border: none; cursor: pointer; font-size: 13px;
           font-weight: 600; white-space: nowrap; }
    .btn-primary { background: var(--primary); color: white;
                   &:disabled { opacity: 0.5; cursor: not-allowed; } }

    .feries-table { margin: 0 24px 24px; border-radius: 10px; overflow: hidden;
                    border: 1px solid var(--gray-mid); }
    .pro-table { width: 100%; border-collapse: collapse; }
    .pro-table thead tr { background: #F5F7F8; }
    .pro-table th { padding: 11px 14px; text-align: left; font-size: 11px;
                    font-weight: 700; color: var(--text-light);
                    text-transform: uppercase; letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--gray-mid); }
    .pro-table tbody tr { border-bottom: 1px solid var(--gray-light); transition: background 0.12s; }
    .pro-table tbody tr:hover { background: #F8FCFC; }
    .pro-table tbody tr:last-child { border-bottom: none; }
    .pro-table td { padding: 12px 14px; font-size: 13px; color: var(--text); }
    .num-col { color: var(--text-light); font-size: 12px; width: 40px; }
    .date-cell { display: flex; align-items: center; gap: 8px; }
    .dc-icon { color: var(--primary); display: flex; }
    .act-btn { background: none; border: none; cursor: pointer; padding: 4px 8px;
               border-radius: 6px; color: #DC2626; transition: background 0.12s;
               display: flex; align-items: center;
               &:hover { background: #FEF2F2; } }
    .empty-row { text-align: center; padding: 32px !important; }
    .empty-content { display: flex; flex-direction: column; align-items: center; gap: 8px;
                     color: var(--text-light);
                     p { font-size: 14px; margin: 0; }
                     small { font-size: 12px; } }
    .table-foot { padding: 10px 14px; font-size: 11px; color: var(--text-light);
                  text-align: right; border-top: 1px solid var(--gray-mid);
                  background: #FAFAFA; }

    .empty-state { display: flex; flex-direction: column; align-items: center;
                   gap: 8px; padding: 32px; color: var(--text-light); text-align: center;
                   p { font-size: 14px; margin: 0; }
                   small { font-size: 12px; } }

    /* Toast */
    .saved-toast {
      position: fixed; bottom: 28px; right: 28px; z-index: 999;
      display: flex; align-items: center; gap: 10px;
      padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      animation: slideUp 0.3s ease;
      &.toast-success { background: #16A34A; color: white; }
      &.toast-error   { background: #DC2626; color: white; }
      &.toast-info    { background: var(--primary); color: white; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .fade-in { animation: fadeIn 0.25s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminConfigComponent implements OnInit {

  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api';

  ic = ICONS;

  activeTab  = signal<Tab>('CONGES');
  congesItems = signal<any[]>([]);
  feries     = signal<any[]>([]);
  toast      = signal<{ show: boolean; message: string; type: string }>(
    { show: false, message: '', type: 'success' }
  );

  newDate  = '';
  newLabel = '';

  // Année sélectionnée pour les boutons rapides (modifiable par l'Admin)
  anneeCourante = new Date().getFullYear();
  anneesDisponibles = [2025, 2026, 2027];

  tabs = [
    { key: 'CONGES'       as Tab, icon: 'calendar', label: 'Congés & Règles' },
    { key: 'JOURS_FERIES' as Tab, icon: 'flag',     label: 'Jours Fériés'   },
  ];

  // ── Fériés civils (dates fixes, mêmes chaque année) ──────────────────────
  get presetsCivils() {
    const y = this.anneeCourante;
    return [
      { label: "Nouvel An",          date: `${y}-01-01`, nom: "Jour de l'An"                    },
      { label: "Indépendance",       date: `${y}-03-20`, nom: "Fête de l'Indépendance"          },
      { label: "Martyrs",            date: `${y}-04-09`, nom: "Journée des Martyrs"             },
      { label: "Travail",            date: `${y}-05-01`, nom: "Fête du Travail"                 },
      { label: "République",         date: `${y}-07-25`, nom: "Fête de la République"           },
      { label: "Femme",              date: `${y}-08-13`, nom: "Fête de la Femme"                },
      { label: "Évacuation",         date: `${y}-10-15`, nom: "Fête de l'Évacuation"            },
    ];
  }

  // ── Fêtes islamiques (calendrier lunaire — dates différentes chaque année) ─
  get presetsIslamiques() {
    const map: Record<number, {label:string; date:string; nom:string}[]> = {
      2025: [
        { label: "Aïd el-Fitr J1",  date: "2025-03-30", nom: "Aïd el-Fitr (1er jour)"           },
        { label: "Aïd el-Fitr J2",  date: "2025-03-31", nom: "Aïd el-Fitr (2ème jour)"          },
        { label: "Aïd el-Adha J1",  date: "2025-06-06", nom: "Aïd el-Adha (1er jour)"           },
        { label: "Aïd el-Adha J2",  date: "2025-06-07", nom: "Aïd el-Adha (2ème jour)"          },
        { label: "Ras el-Am",       date: "2025-06-26", nom: "Ras el-Am el-Hijri"                },
        { label: "Mouled",          date: "2025-09-04", nom: "Mouled (Naissance du Prophète)"    },
      ],
      2026: [
        { label: "Aïd el-Fitr J1",  date: "2026-03-20", nom: "Aïd el-Fitr (1er jour)"           },
        { label: "Aïd el-Fitr J2",  date: "2026-03-21", nom: "Aïd el-Fitr (2ème jour)"          },
        { label: "Aïd el-Adha J1",  date: "2026-05-27", nom: "Aïd el-Adha (1er jour)"           },
        { label: "Aïd el-Adha J2",  date: "2026-05-28", nom: "Aïd el-Adha (2ème jour)"          },
        { label: "Ras el-Am",       date: "2026-07-16", nom: "Ras el-Am el-Hijri"                },
        { label: "Mouled",          date: "2026-09-04", nom: "Mouled (Naissance du Prophète)"    },
      ],
      2027: [
        { label: "Aïd el-Fitr J1",  date: "2027-03-09", nom: "Aïd el-Fitr (1er jour)"           },
        { label: "Aïd el-Fitr J2",  date: "2027-03-10", nom: "Aïd el-Fitr (2ème jour)"          },
        { label: "Aïd el-Adha J1",  date: "2027-05-16", nom: "Aïd el-Adha (1er jour)"           },
        { label: "Aïd el-Adha J2",  date: "2027-05-17", nom: "Aïd el-Adha (2ème jour)"          },
        { label: "Ras el-Am",       date: "2027-07-06", nom: "Ras el-Am el-Hijri"                },
        { label: "Mouled",          date: "2027-08-24", nom: "Mouled (Naissance du Prophète)"    },
      ],
    };
    return map[this.anneeCourante] ?? [];
  }

  ngOnInit(): void {
    // Charger uniquement les paramètres de congés (seule catégorie connectée au moteur)
    this.http.get<any>(`${this.API}/admin/config/CONGES`).subscribe({
      next: (data) => {
        const items = Object.entries(data ?? {}).map(([key, v]: any) => ({
          key,
          description: v.description,
          type: v.type,
          val: v.value
        }));
        this.congesItems.set(items);
      },
      error: () => this.showToast('Impossible de charger la configuration', 'error')
    });

    // Charger les jours fériés depuis la vraie table jours_feries (via endpoint RH)
    this.http.get<any[]>(`${this.API}/rh/conges/jours-feries`).subscribe({
      next: (data) => this.feries.set(
        (data ?? []).map(f => ({ id: f.id, date: f.date, label: f.description }))
      ),
      error: () => {}
    });
  }

  // Sauvegarder un paramètre de congé dans system_config
  save(key: string, value: string): void {
    this.http.put(`${this.API}/admin/config/${key}`, { value }).subscribe({
      next: () => this.showToast('Paramètre sauvegardé', 'success'),
      error: () => this.showToast('Erreur de sauvegarde', 'error')
    });
  }

  toggleBool(item: any): void {
    item.val = item.val === 'true' ? 'false' : 'true';
    this.save(item.key, item.val);
  }

  // Valeur affichée dans le résumé
  getVal(key: string): string {
    return this.congesItems().find(i => i.key === key)?.val ?? '—';
  }

  // Vérifie si un préset est déjà dans la liste
  isAlreadyAdded(date: string): boolean {
    return this.feries().some(f => f.date?.startsWith(date));
  }

  // Ajouter un jour férié (écrit dans jours_feries via endpoint RH)
  addFerie(): void {
    if (!this.newDate || !this.newLabel) return;
    this.http.post(`${this.API}/rh/conges/jours-feries`,
      { date: this.newDate, description: this.newLabel, recurrent: false }
    ).subscribe({
      next: (d: any) => {
        this.feries.update(f => [...f, { id: d.id, date: d.date, label: d.description }]);
        this.newDate  = '';
        this.newLabel = '';
        this.showToast('Jour férié ajouté', 'success');
      },
      error: () => this.showToast('Erreur lors de l\'ajout', 'error')
    });
  }

  addPreset(p: { date: string; nom: string; recurrent?: boolean }): void {
    if (this.isAlreadyAdded(p.date)) {
      this.showToast(`${p.nom} est déjà dans la liste`, 'info'); return;
    }
    this.http.post(`${this.API}/rh/conges/jours-feries`,
      { date: p.date, description: p.nom, recurrent: p.recurrent ?? false }
    ).subscribe({
      next: (d: any) => {
        this.feries.update(f => [...f, { id: d.id, date: d.date, label: d.description }]);
        this.showToast(`${p.nom} ajouté`, 'success');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  delFerie(id: number): void {
    if (!confirm('Supprimer ce jour férié ?')) return;
    this.http.delete(`${this.API}/rh/conges/jours-feries/${id}`).subscribe({
      next: () => {
        this.feries.update(f => f.filter(x => x.id !== id));
        this.showToast('Jour férié supprimé', 'info');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR',
        { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() => this.toast.set({ show: false, message: '', type: 'success' }), 3000);
  }
}