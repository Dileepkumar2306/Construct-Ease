import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private getBaseUrl(): string {
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    
    const isLocal = hostname === 'localhost' || 
                    hostname === '127.0.0.1' || 
                    hostname.startsWith('192.168.') || 
                    hostname.startsWith('10.') || 
                    hostname.startsWith('172.');
                    
    if (isLocal) {
      return `http://${hostname}:5000/api`;
    } else if (origin.includes('vercel.app')) {
      return '/api';
    } else {
      return 'https://gkconstructease.vercel.app/api';
    }
  }
  private baseUrl = this.getBaseUrl();
  
  isLoginModalOpen = false;
  activeLocation = localStorage.getItem('user_location') || 'Hyderabad';
  
  currentUser: any = JSON.parse(localStorage.getItem('current_user') || 'null');

  get isOwner(): boolean {
    return this.currentUser?.role === 'owner' || this.currentUser?.role === 'admin';
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  setActiveLocation(location: string) {
    this.activeLocation = location;
    localStorage.setItem('user_location', location);
  }

  // ── AUTHENTICATION METHODS ──────────────────────────────────────────────────

  ownerLogin(credentials: { phone: string; password: string; name?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/owner-login`, credentials).pipe(
      tap(res => {
        if (res.user && res.token) {
          this.currentUser = res.user;
          localStorage.setItem('current_user', JSON.stringify(res.user));
          localStorage.setItem('auth_token', res.token);
        }
      })
    );
  }

  customerLogin(credentials: { email: string; password: string; name?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/customer-login`, credentials).pipe(
      tap(res => {
        if (res.user && res.token) {
          this.currentUser = res.user;
          localStorage.setItem('current_user', JSON.stringify(res.user));
          localStorage.setItem('auth_token', res.token);
        }
      })
    );
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  // ── DATA METHODS ────────────────────────────────────────────────────────────

  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/templates`);
  }

  getBhkDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bhk-details`);
  }

  uploadTemplate(template: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/templates`, template);
  }

  deleteTemplate(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/templates/${id}`);
  }

  getPromotions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/promotions`);
  }

  createPromotion(promo: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/promotions`, promo);
  }

  updatePromotion(id: string, promo: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/promotions/${id}`, promo);
  }

  deletePromotion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/promotions/${id}`);
  }

  likePromotion(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/promotions/${id}/like`, {});
  }

  addComment(id: string, username: string, text: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/promotions/${id}/comment`, { username, text });
  }

  estimateCost(area: number, quality: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/estimate`, { area, quality });
  }

  // Interior API Methods
  estimateInteriorCost(area: number, style: string, quality: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/interior/estimate`, { area, style, quality });
  }

  getVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/interior/vendors`);
  }

  getProfessionals(location?: string): Observable<any[]> {
    const url = location ? `${this.baseUrl}/interior/professionals?location=${location}` : `${this.baseUrl}/interior/professionals`;
    return this.http.get<any[]>(url);
  }

  // ── AI HUB METHODS ──────────────────────────────────────────────────────────

  aiEstimate(payload: {
    area: number; city: string; floors: number; quality: string; projectType: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/estimate`, payload);
  }

  aiRiskScan(contractText: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/risk-scan`, { contractText });
  }

  aiRoomPlanner(payload: {
    totalArea: number; rooms: number; style: string; floors: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/room-planner`, payload);
  }

  aiTimeline(payload: {
    area: number; quality: string; startDate: string; projectType: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/timeline`, payload);
  }

  aiArchRecs(payload: {
    budget: string; region: string; preference: string; plotSize: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/arch-recs`, payload);
  }

  aiMaterialPrice(materials: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/material-price`, { materials });
  }

  aiDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ai/dashboard`);
  }

  aiDesignSuggest(payload: { image: string; roomType: string; style: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/design-suggest`, payload);
  }

  // ── PORTFOLIO CRUD METHODS ──────────────────────────────────────────────────

  getPortfolio(role?: string, category?: string): Observable<any[]> {
    let url = `${this.baseUrl}/portfolio`;
    const params: string[] = [];
    if (role) params.push(`role=${role}`);
    if (category) params.push(`category=${category}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<any[]>(url);
  }

  createPortfolioItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/portfolio`, item);
  }

  updatePortfolioItem(id: string, item: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/portfolio/${id}`, item);
  }

  deletePortfolioItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/portfolio/${id}`);
  }

  getProfessionalsList(location?: string, role?: string): Observable<any[]> {
    let url = `${this.baseUrl}/professionals`;
    const params: string[] = [];
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    if (role && role !== 'All') params.push(`role=${encodeURIComponent(role)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<any[]>(url);
  }

  sendInquiry(inquiryData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/inquiries`, inquiryData);
  }
}
