import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client';
  isMenuOpen = false;
  apiService = inject(ApiService);
  private router = inject(Router);
  isHome = false;

  constructor() {
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/' || this.router.url.split('?')[0] === '/';
      if (typeof document !== 'undefined') {
        if (this.isHome) {
          document.body.classList.add('home-theme');
        } else {
          document.body.classList.remove('home-theme');
        }
      }
    });
  }

  isSubmitting = false;
  showSuccessToast = false;
  savedQuoteId = '';

  isDetectingLocation = false;
  showLocationSelector = false;
  locationSearchQuery = '';

  quoteData = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceType: 'Construction',
    projectArea: null,
    message: ''
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.showLocationSelector = false;
  }

  toggleLocationSelector(event: MouseEvent) {
    event.stopPropagation();
    this.showLocationSelector = !this.showLocationSelector;
  }

  selectLocation(city: string) {
    if (!city || !city.trim()) return;
    const cleanCity = city.trim();
    const formattedCity = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1);
    this.apiService.setActiveLocation(formattedCity);
    this.showLocationSelector = false;
    this.locationSearchQuery = '';
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: formattedCity }));
  }

  detectLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.isDetectingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`)
          .then((res) => res.json())
          .then((data) => {
            this.isDetectingLocation = false;
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state_district || '';
              if (city) {
                this.selectLocation(city);
              } else {
                alert('Could not determine city name. Please select manually.');
              }
            } else {
              alert('Could not resolve location. Please select manually.');
            }
          })
          .catch((err) => {
            console.error("Reverse geocoding error:", err);
            this.isDetectingLocation = false;
            alert('Geocoding service unavailable. Please select manually.');
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        this.isDetectingLocation = false;
        alert('Could not retrieve GPS coordinates. Please select manually.');
      },
      { timeout: 10000 }
    );
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openQuoteModal() {
    this.apiService.isQuoteModalOpen = true;
    this.isMenuOpen = false; // close mobile menu if open
  }

  closeQuoteModal() {
    this.apiService.isQuoteModalOpen = false;
  }

  submitQuoteForm() {
    this.isSubmitting = true;
    this.apiService.sendQuoteRequest(this.quoteData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.savedQuoteId = res.quote?._id || 'mock_id_' + Math.random().toString(36).substring(2, 6);
        this.closeQuoteModal();
        this.showSuccessToast = true;

        // Reset form
        this.quoteData = {
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          serviceType: 'Construction',
          projectArea: null,
          message: ''
        };

        // Hide toast after 4 seconds
        setTimeout(() => {
          this.showSuccessToast = false;
        }, 4000);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to submit quote:', err);
        alert('There was an error saving your request. Please try again.');
      }
    });
  }
}

