import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, CommonModule],
  template: `
    <div class="layout" [class.collapsed]="sidebarCollapsed()">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />

      <div class="main-area">
        <app-navbar
          (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />
        <main class="content fade-in">
          <router-outlet />
        </main>
      </div>
    </div>
    
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;

      .main-area {
        flex: 1;
        margin-left: var(--sidebar-width);
        transition: margin-left 0.3s ease;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      &.collapsed .main-area {
        margin-left: var(--sidebar-collapsed);
      }

      .content {
        flex: 1;
        padding: 28px;
        overflow-y: auto;
      }
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  
}
