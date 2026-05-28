import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ArchitectDashboardComponent } from './components/architect-dashboard/architect-dashboard.component';
import { BuilderDashboardComponent } from './components/builder-dashboard/builder-dashboard.component';
import { InteriorStudioComponent } from './components/interior-studio/interior-studio.component';
import { CompanyPromotionComponent } from './components/company-promotion/company-promotion.component';
import { AiHubComponent } from './components/ai-hub/ai-hub.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'customer', component: CustomerDashboardComponent },
    { path: 'architect', component: ArchitectDashboardComponent },
    { path: 'builder', component: BuilderDashboardComponent },
    { path: 'interior', component: InteriorStudioComponent },
    { path: 'promote', component: CompanyPromotionComponent },
    { path: 'ai-hub', component: AiHubComponent },
    { path: '**', redirectTo: '' }
];
