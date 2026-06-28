import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api';
  isQuoteModalOpen = false;
  activeLocation = localStorage.getItem('user_location') || 'Hyderabad';

  setActiveLocation(location: string) {
    this.activeLocation = location;
    localStorage.setItem('user_location', location);
  }

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

  /** AI Cost Estimator — detailed breakdown with cement, steel, labor */
  aiEstimate(payload: {
    area: number; city: string; floors: number; quality: string; projectType: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/estimate`, payload);
  }

  /** Contract Risk Scanner — detect risky clauses with severity ratings */
  aiRiskScan(contractText: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/risk-scan`, { contractText });
  }

  /** AI Room Planner — recommended room dimensions and furniture */
  aiRoomPlanner(payload: {
    totalArea: number; rooms: number; style: string; floors: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/room-planner`, payload);
  }

  /** AI Timeline Predictor — construction phases with milestone dates */
  aiTimeline(payload: {
    area: number; quality: string; startDate: string; projectType: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/timeline`, payload);
  }

  /** Architecture Recommender — top 3 styles with pros/cons */
  aiArchRecs(payload: {
    budget: string; region: string; preference: string; plotSize: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/arch-recs`, payload);
  }

  /** Material Price Predictor — current prices, trends, forecasts */
  aiMaterialPrice(materials: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ai/material-price`, { materials });
  }

  /** AI Management Dashboard — stats and recent activity */
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

  sendQuoteRequest(quoteData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quotes`, quoteData);
  }

  getQuoteRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quotes`);
  }
}
