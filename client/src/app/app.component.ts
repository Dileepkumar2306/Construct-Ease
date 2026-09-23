import { Component, inject, HostListener, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  title = 'client';
  isMenuOpen = false;
  apiService = inject(ApiService);
  private router = inject(Router);
  isHome = false;

  constructor() {
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/' || this.router.url.split('?')[0] === '/';
    });
  }

  ngOnInit() {
    // Check if there are external URL params for auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'login') {
      this.openAuthModal('login');
    } else if (urlParams.get('auth') === 'register') {
      this.openAuthModal('register');
    }
  }

  isDetectingLocation = false;
  showLocationSelector = false;
  locationSearchQuery = '';

  // Auth Modal State & Flow
  authModalMode: 'register' | 'login' = 'register';
  activeAuthTab: 'customer' | 'owner' = 'customer';
  isAuthenticating = false;
  authErrorMessage = '';
  authSuccessMessage = '';

  // Password Visibility Flags
  showRegisterPassword = false;
  showConfirmPassword = false;
  showLoginPassword = false;
  showOwnerPassword = false;

  // Google Sign-In helper state
  showGooglePrompt = false;
  googleCustomName = '';
  googleCustomEmail = '';

  // Form Models
  registerForm = {
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  customerLoginForm = {
    identifier: '',
    password: ''
  };

  ownerForm = {
    name: '',
    phone: '',
    password: ''
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

  // ── AUTH MODAL CONTROLLERS ──────────────────────────────────────────────────

  openAuthModal(mode: 'register' | 'login' = 'register', tab: 'customer' | 'owner' = 'customer') {
    this.authModalMode = mode;
    this.activeAuthTab = tab;
    this.authErrorMessage = '';
    this.authSuccessMessage = '';
    this.showGooglePrompt = false;
    this.apiService.isLoginModalOpen = true;
    this.isMenuOpen = false;
  }

  // Backwards-compatible alias for any child components calling openLoginModal
  openLoginModal(tab: 'customer' | 'owner' = 'customer') {
    this.openAuthModal('login', tab);
  }

  closeAuthModal() {
    this.apiService.isLoginModalOpen = false;
    this.authErrorMessage = '';
    this.authSuccessMessage = '';
    this.showGooglePrompt = false;
  }

  switchAuthMode(mode: 'register' | 'login') {
    this.authModalMode = mode;
    this.authErrorMessage = '';
    // Preserve any success message when transitioning from register to login
    if (mode === 'register') {
      this.authSuccessMessage = '';
    }
  }

  switchAuthTab(tab: 'customer' | 'owner') {
    this.activeAuthTab = tab;
    this.authErrorMessage = '';
  }

  // ── CUSTOMER REGISTRATION ───────────────────────────────────────────────────

  submitCustomerRegister() {
    this.authErrorMessage = '';
    this.authSuccessMessage = '';

    if (!this.registerForm.name || !this.registerForm.name.trim()) {
      this.authErrorMessage = 'Please enter your Full Name.';
      return;
    }

    if (!this.registerForm.phone || !this.registerForm.phone.trim()) {
      this.authErrorMessage = 'Please enter your 10-digit Mobile Number.';
      return;
    }

    const cleanPhone = this.registerForm.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      this.authErrorMessage = 'Please enter a valid 10-digit Mobile Number.';
      return;
    }

    if (!this.registerForm.email || !this.registerForm.email.trim()) {
      this.authErrorMessage = 'Please enter your Email Address.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerForm.email.trim())) {
      this.authErrorMessage = 'Please enter a valid Email Address.';
      return;
    }

    if (!this.registerForm.password || this.registerForm.password.length < 6) {
      this.authErrorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.authErrorMessage = 'Passwords do not match. Please verify.';
      return;
    }

    this.isAuthenticating = true;

    this.apiService.customerRegister({
      name: this.registerForm.name.trim(),
      email: this.registerForm.email.trim(),
      phone: cleanPhone,
      password: this.registerForm.password
    }).subscribe({
      next: (res) => {
        this.isAuthenticating = false;
        // On successful registration: Move customer to Login page and prefill identifier
        this.authSuccessMessage = res.message || '🎉 Registration successful! Please log in with your credentials.';
        this.customerLoginForm.identifier = this.registerForm.email.trim() || cleanPhone;
        this.customerLoginForm.password = '';
        
        // Reset password fields
        this.registerForm.password = '';
        this.registerForm.confirmPassword = '';
        
        // Switch to login mode
        this.authModalMode = 'login';
        this.activeAuthTab = 'customer';
      },
      error: (err) => {
        console.error("Customer registration error:", err);
        this.isAuthenticating = false;
        this.authErrorMessage = err.error?.message || (err.status === 0 ? 'Server is offline. Please restart backend server.' : 'Registration failed. Please try again.');
      }
    });
  }

  // ── CUSTOMER LOGIN ──────────────────────────────────────────────────────────

  submitCustomerLogin() {
    this.authErrorMessage = '';
    this.authSuccessMessage = '';

    if (!this.customerLoginForm.identifier || !this.customerLoginForm.identifier.trim()) {
      this.authErrorMessage = 'Please enter your Email Address or Mobile Number.';
      return;
    }

    if (!this.customerLoginForm.password) {
      this.authErrorMessage = 'Please enter your Password.';
      return;
    }

    this.isAuthenticating = true;

    this.apiService.customerLogin({
      identifier: this.customerLoginForm.identifier.trim(),
      password: this.customerLoginForm.password
    }).subscribe({
      next: (res) => {
        this.isAuthenticating = false;
        this.closeAuthModal();
      },
      error: (err) => {
        console.error("Customer login error:", err);
        this.isAuthenticating = false;
        this.authErrorMessage = err.error?.message || (err.status === 0 ? 'Server is offline. Please restart backend server.' : 'Login failed. Please check your credentials.');
      }
    });
  }

  // ── OWNER LOGIN ─────────────────────────────────────────────────────────────

  submitOwnerLogin() {
    this.authErrorMessage = '';
    this.authSuccessMessage = '';

    if (!this.ownerForm.phone || !this.ownerForm.password) {
      this.authErrorMessage = 'Please enter both Mobile Number and Password.';
      return;
    }

    this.isAuthenticating = true;

    this.apiService.ownerLogin(this.ownerForm).subscribe({
      next: (res) => {
        this.isAuthenticating = false;
        this.closeAuthModal();
      },
      error: (err) => {
        console.error("Owner login error:", err);
        this.isAuthenticating = false;
        this.authErrorMessage = err.error?.message || (err.status === 0 ? 'Server is offline. Please restart backend server.' : 'Login failed. Please check your credentials.');
      }
    });
  }

  // ── DIRECT GOOGLE AUTHENTICATION ────────────────────────────────────────────

  triggerGoogleAuth() {
    this.authErrorMessage = '';
    this.authSuccessMessage = '';
    
    // Open Google interactive prompt/login sheet
    this.showGooglePrompt = true;
    if (!this.googleCustomName && this.registerForm.name) {
      this.googleCustomName = this.registerForm.name;
    }
    if (!this.googleCustomEmail && this.registerForm.email) {
      this.googleCustomEmail = this.registerForm.email;
    }
  }

  executeGoogleLogin(email?: string, name?: string) {
    const finalEmail = (email || this.googleCustomEmail || 'google.user@constructease.com').toLowerCase().trim();
    const finalName = name || this.googleCustomName || (finalEmail.split('@')[0].charAt(0).toUpperCase() + finalEmail.split('@')[0].slice(1));

    if (!finalEmail.includes('@')) {
      this.authErrorMessage = 'Please enter a valid Google email address.';
      return;
    }

    this.isAuthenticating = true;
    this.authErrorMessage = '';

    this.apiService.googleLogin({
      email: finalEmail,
      name: finalName,
      googleId: 'google_' + Math.random().toString(36).substring(2, 11),
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    }).subscribe({
      next: (res) => {
        this.isAuthenticating = false;
        this.showGooglePrompt = false;
        this.closeAuthModal();
      },
      error: (err) => {
        console.error("Google Auth error:", err);
        this.isAuthenticating = false;
        this.authErrorMessage = err.error?.message || 'Google authentication failed. Please try again.';
      }
    });
  }

  logout() {
    this.apiService.logout();
  }
}
