import {
  Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Tab = 'ENTREPRISE' | 'CONGES' | 'WORKFLOW'
         | 'NOTIF' | 'JOURS_FERIES';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-config fade-in">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>⚙️ Configuration du Système</h1>
        
      </div>
    </div>

    <!-- Tabs -->
    <div class="cfg-tabs">
      <button class="ct"
              *ngFor="let t of tabs"
              [class.active]="activeTab() === t.key"
              (click)="activeTab.set(t.key)">
        {{ t.icon }} {{ t.label }}
      </button>
    </div>

    

   

    

    <!-- ===== NOTIFICATIONS ===== -->
    <div *ngIf="activeTab() === 'NOTIF'"
         class="cfg-panel fade-in">
      <div class="panel-head">
        <h2>🔔 Modèles d'emails et notifications</h2>
        <p>Configuration SMTP et événements déclenchant
           des notifications automatiques.</p>
      </div>
      <div class="cfg-grid">
        <div class="cfg-field"
             *ngFor="let item of getItems('NOTIF')">
          <label>{{ item.description }}</label>
          <div *ngIf="item.type === 'BOOLEAN'"
               class="toggle-row"
               (click)="toggleBool(item)">
            <div class="toggle"
                 [class.on]="item.val === 'true'">
              <div class="tknob"></div>
            </div>
            <span class="toggle-label">
              {{ item.val === 'true' ? 'Activé' : 'Désactivé' }}
            </span>
          </div>
          <input *ngIf="item.type !== 'BOOLEAN'"
                 type="text"
                 [(ngModel)]="item.val"
                 (blur)="save(item.key, item.val)"
                 class="cfg-input" />
        </div>
      </div>

      <!-- Événements notifiés -->
      <div class="events-section">
        <h3>📧 Événements déclenchant un email</h3>
        <div class="events-grid">
          <div class="ev-item" *ngFor="let e of emailEvents">
            <span class="ev-icon">{{ e.icon }}</span>
            <span class="ev-label">{{ e.label }}</span>
            <span class="ev-status">✅ Actif</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== JOURS FÉRIÉS ===== -->
    <div *ngIf="activeTab() === 'JOURS_FERIES'"
         class="cfg-panel fade-in">
      <div class="panel-head">
        <h2>🗓️ Jours fériés</h2>
        <p>Ces jours sont exclus du calcul des jours ouvrables
           pour les congés.</p>
      </div>

      <!-- Ajouter un jour férié -->
      <div class="add-ferie">
        <div class="form-group">
          <label>Date</label>
          <input type="date" [(ngModel)]="newDate" />
        </div>
        <div class="form-group" style="flex:2">
          <label>Libellé</label>
          <input type="text" [(ngModel)]="newLabel"
                 placeholder="Ex: Fête du Travail" />
        </div>
        <button class="btn btn-primary"
                (click)="addFerie()"
                [disabled]="!newDate || !newLabel">
          ➕ Ajouter
        </button>
      </div>

      <!-- Liste jours fériés -->
      <div class="feries-table">
        <table class="pro-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of feries()">
              <td>
                <strong>{{ f.date | date:'dd MMMM yyyy':'':'fr' }}</strong>
              </td>
              <td>{{ f.label }}</td>
              <td>
                <button class="act-btn"
                        (click)="delFerie(f.id)">
                  🗑️
                </button>
              </td>
            </tr>
            <tr *ngIf="feries().length === 0">
              <td colspan="3" class="empty-row">
                Aucun jour férié configuré
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Saved toast -->
    <div class="saved-toast" *ngIf="saved()">
      ✅ Configuration enregistrée
    </div>

    <!-- Global toast -->
    <div class="g-toast" [class.show]="toast().show"
         [class]="'g-toast ' + toast().type">
      {{ toast().message }}
    </div>
  </div>
  `,
  styles: [`
    .admin-config { max-width: 1100px; }

    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 20px; font-weight: 700;
           color: var(--primary-dark); }
      p  { font-size: 12px; color: var(--text-light); margin-top: 2px; }
    }

    // ===== TABS =====
    .cfg-tabs {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px;
    }

    .ct {
      padding: 10px 18px; border: 2px solid var(--gray-mid);
      background: white; border-radius: 10px; cursor: pointer;
      font-size: 13px; font-weight: 600; color: var(--text-light);
      transition: all 0.2s;
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active {
        border-color: var(--primary); background: var(--accent);
        color: var(--primary);
      }
    }

    // ===== PANEL =====
    .cfg-panel {
      background: white; border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 10px rgba(11,110,126,0.07);
    }

    .panel-head {
      margin-bottom: 20px; padding-bottom: 14px;
      border-bottom: 1px solid var(--gray-mid);
      h2 { font-size: 16px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 4px; }
      p  { font-size: 13px; color: var(--text-light); }
    }

    .cfg-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .cfg-field {
      label { font-size: 11px; font-weight: 700;
               color: var(--text-light); display: block;
               margin-bottom: 7px; text-transform: uppercase;
               letter-spacing: 0.5px; }
    }

    .cfg-input {
      width: 100%; padding: 10px 12px;
      border: 2px solid var(--gray-mid); border-radius: 8px;
      font-size: 13px; outline: none; transition: border-color 0.2s;
      &:focus { border-color: var(--secondary); }
    }

    // ===== TOGGLE =====
    .toggle-row {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; padding: 8px 0;

      .toggle {
        width: 42px; height: 22px; border-radius: 11px;
        background: var(--gray-mid); position: relative;
        transition: background 0.3s; flex-shrink: 0;
        &.on { background: var(--primary); }
        .tknob {
          width: 16px; height: 16px; border-radius: 50%;
          background: white; position: absolute;
          top: 3px; left: 3px; transition: transform 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        &.on .tknob { transform: translateX(20px); }
      }

      .toggle-label { font-size: 13px; font-weight: 600;
                       color: var(--text); }
    }

    // ===== WORKFLOW =====
    .wf-card {
      background: var(--accent); border-radius: 14px;
      padding: 20px; margin-bottom: 24px;
      h3 { font-size: 13px; font-weight: 700;
           color: var(--primary); margin-bottom: 16px; }
    }

    .wf-steps {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }

    .wfs-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 5px;

      .wfs-circle {
        width: 50px; height: 50px; border-radius: 50%;
        background: white; border: 2px solid var(--secondary);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        box-shadow: 0 2px 8px rgba(11,110,126,0.1);
      }

      span  { font-size: 12px; font-weight: 700; color: var(--primary); }
      small { font-size: 10px; color: var(--text-light); }

      &.success .wfs-circle {
        background: #C6F6D5; border-color: #38A169;
      }
    }

    .wfs-arrow { font-size: 22px; color: var(--secondary);
                  font-weight: 700; }

    // ===== EMAIL EVENTS =====
    .events-section {
      margin-top: 24px; padding-top: 18px;
      border-top: 1px solid var(--gray-mid);
      h3 { font-size: 14px; font-weight: 700;
           color: var(--primary-dark); margin-bottom: 14px; }
    }

    .events-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      @media (max-width: 768px) { grid-template-columns: repeat(2,1fr); }
    }

    .ev-item {
      display: flex; align-items: center; gap: 8px;
      background: var(--gray-light); border-radius: 8px;
      padding: 8px 12px;
      .ev-icon   { font-size: 16px; flex-shrink: 0; }
      .ev-label  { flex: 1; font-size: 12px; color: var(--text); }
      .ev-status { font-size: 12px; color: var(--success); }
    }

    // ===== JOURS FÉRIÉS =====
    .add-ferie {
      display: flex; gap: 12px; align-items: flex-end;
      margin-bottom: 20px; flex-wrap: wrap;
      .form-group { flex: 1; min-width: 140px; }
    }

    .feries-table { overflow: hidden; border-radius: 10px;
                     border: 1px solid var(--gray-mid); }

    .pro-table {
      width: 100%; border-collapse: collapse;
      thead tr { background: #f8fafa;
        th { padding: 12px 14px; text-align: left; font-size: 11px;
             font-weight: 700; color: var(--text-light);
             text-transform: uppercase; letter-spacing: 0.5px;
             border-bottom: 1px solid var(--gray-mid); }
      }
      tbody tr {
        border-bottom: 1px solid var(--gray-light);
        transition: background 0.15s;
        &:hover { background: #f8fcfc; }
        &:last-child { border-bottom: none; }
        td { padding: 12px 14px; font-size: 13px; }
      }
    }

    .act-btn {
      width: 28px; height: 28px; border: none;
      background: var(--gray-light); border-radius: 6px;
      cursor: pointer; font-size: 13px; transition: all 0.2s;
      &:hover { background: #FED7D7; transform: scale(1.1); }
    }

    .empty-row { text-align: center; padding: 30px !important;
                  color: var(--text-light); font-size: 13px; }

    // ===== TOAST =====
    .saved-toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: #C6F6D5; color: #276749;
      padding: 10px 20px; border-radius: 10px;
      font-size: 13px; font-weight: 600;
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
      animation: fadeIn 0.3s ease;
    }

    .g-toast {
      position: fixed; bottom: 24px; right: 24px;
      padding: 12px 18px; border-radius: 10px; font-size: 13px;
      font-weight: 600; transform: translateY(60px); opacity: 0;
      transition: all 0.3s; z-index: 2000;
      &.show    { transform: translateY(0); opacity: 1; }
      &.success { background: #C6F6D5; color: #276749; }
      &.error   { background: #FED7D7; color: #822727; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `]
})
export class AdminConfigComponent implements OnInit {

  private http = inject(HttpClient);
  private API  = 'http://localhost:8080/api';

  activeTab = signal<Tab>('ENTREPRISE');
  configs   = signal<any>({});
  feries    = signal<any[]>([]);
  saved     = signal(false);
  newDate   = '';
  newLabel  = '';

  toast = signal<{show:boolean; message:string; type:string}>(
    { show: false, message: '', type: 'success' }
  );

  tabs = [
    
    { key: 'NOTIF'        as Tab, icon: '🔔', label: 'Notifications' },
    { key: 'JOURS_FERIES' as Tab, icon: '🗓️', label: 'Jours Fériés' }
  ];

  emailEvents = [
    { icon: '👋', label: 'Bienvenue & compte créé' },
    { icon: '✅', label: 'Congé validé' },
    { icon: '❌', label: 'Congé refusé' },
    { icon: '💰', label: 'Avance accordée' },
    { icon: '📈', label: 'Augmentation validée' },
    { icon: '🔒', label: 'Compte verrouillé' },
    { icon: '🔑', label: 'Reset mot de passe' },
    { icon: '⚠️', label: 'Solde congés faible' },
    { icon: '🎂', label: 'Anniversaire professionnel' }
  ];

  ngOnInit(): void {
    this.http.get<any>(`${this.API}/admin/config`)
      .subscribe(d => this.configs.set(d ?? {}));

    this.http.get<any[]>(
      `${this.API}/admin/config/jours-feries`
    ).subscribe(d => this.feries.set(d ?? []));
  }

  getItems(cat: string): any[] {
    const data = this.configs()[cat] ?? {};
    return Object.entries(data).map(([key, v]: any) => ({
      key, description: v.description, type: v.type, val: v.value
    }));
  }

  getWFItems(): any[] {
    return this.getItems('CONGES')
      .filter(i => i.type === 'BOOLEAN');
  }

  save(key: string, value: string): void {
    this.http.put(
      `${this.API}/admin/config/${key}`, { value }
    ).subscribe({
      next: () => {
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2000);
      },
      error: () => this.showToast('Erreur sauvegarde', 'error')
    });
  }

  toggleBool(item: any): void {
    item.val = item.val === 'true' ? 'false' : 'true';
    this.save(item.key, item.val);
  }

  addFerie(): void {
    this.http.post(
      `${this.API}/admin/config/jours-feries`,
      { date: this.newDate, label: this.newLabel }
    ).subscribe({
      next: (d: any) => {
        this.feries.update(f => [...f, d]);
        this.newDate  = '';
        this.newLabel = '';
        this.showToast('Jour férié ajouté', 'success');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  delFerie(id: number): void {
    if (!confirm('Supprimer ce jour férié ?')) return;
    this.http.delete(
      `${this.API}/admin/config/jours-feries/${id}`
    ).subscribe({
      next: () => {
        this.feries.update(f => f.filter(x => x.id !== id));
        this.showToast('Supprimé', 'info');
      },
      error: () => this.showToast('Erreur', 'error')
    });
  }

  showToast(message: string, type: string): void {
    this.toast.set({ show: true, message, type });
    setTimeout(() =>
      this.toast.set({ show: false, message: '', type: 'success' }),
      3000
    );
  }
}