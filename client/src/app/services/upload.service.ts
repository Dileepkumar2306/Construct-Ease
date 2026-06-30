import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map, filter } from 'rxjs';

export interface UploadResult {
  url:    string;
  path:   string;
  bucket: string;
}

export type StorageBucket =
  | 'company-assets'
  | 'portfolio'
  | 'promotions'
  | 'profiles'
  | 'ai-uploads';

@Injectable({ providedIn: 'root' })
export class UploadService {

  private getApiUrl(): string {
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
  private readonly apiUrl = this.getApiUrl();

  constructor(private http: HttpClient) {}

  /**
   * Upload a file to Supabase Storage via the Express backend.
   *
   * @param file    The File object to upload
   * @param bucket  One of the allowed storage buckets
   * @param folder  Optional subfolder within the bucket (e.g. 'architect/logos')
   * @returns       Observable emitting the upload progress (0-100) and the final { url }
   */
  uploadFile(
    file:   File,
    bucket: StorageBucket = 'portfolio',
    folder: string = ''
  ): Observable<{ progress?: number; result?: UploadResult }> {
    const formData = new FormData();
    formData.append('file',   file);
    formData.append('bucket', bucket);
    if (folder) formData.append('folder', folder);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round(100 * event.loaded / event.total);
          return { progress };
        }
        if (event.type === HttpEventType.Response) {
          return { result: event.body as UploadResult };
        }
        return {};
      }),
      filter(v => v.progress !== undefined || v.result !== undefined)
    );
  }

  /**
   * Simple one-shot upload — returns an Observable that emits just the URL string.
   */
  uploadFileSimple(
    file:   File,
    bucket: StorageBucket = 'portfolio',
    folder: string = ''
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file',   file);
    formData.append('bucket', bucket);
    if (folder) formData.append('folder', folder);

    return this.http
      .post<UploadResult>(`${this.apiUrl}/upload`, formData)
      .pipe(map(res => res.url));
  }

  /**
   * Delete a file from Supabase Storage.
   */
  deleteFile(bucket: StorageBucket, filePath: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/upload`, {
      body: { bucket, filePath }
    });
  }
}
