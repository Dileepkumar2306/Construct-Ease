import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  apiService = inject(ApiService);

  activeWelcomeSlide = 0;
  activeRoleSlide = 0;
  activeStepSlide = 0;

  openLoginModal() {
    this.apiService.isLoginModalOpen = true;
  }

  onScroll(event: any, type: 'welcome' | 'roles' | 'steps') {
    const el = event.target;
    const count = el.children.length;
    if (count > 0) {
      const index = Math.round(el.scrollLeft / (el.scrollWidth / count));
      if (type === 'welcome') this.activeWelcomeSlide = index;
      if (type === 'roles') this.activeRoleSlide = index;
      if (type === 'steps') this.activeStepSlide = index;
    }
  }

  scrollTo(element: HTMLElement, index: number) {
    const card = element.children[index] as HTMLElement;
    if (card) {
      element.scrollTo({
        left: card.offsetLeft - (element.clientWidth - card.clientWidth) / 2,
        behavior: 'smooth'
      });
    }
  }
}
