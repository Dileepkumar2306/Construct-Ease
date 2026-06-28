import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-company-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-promotion.component.html',
  styleUrls: ['./company-promotion.component.css']
})
export class CompanyPromotionComponent implements OnInit {
  private apiService = inject(ApiService);

  promotions: any[] = [];
  filteredPromotions: any[] = [];
  isLoading = true;
  error = false;

  // Search & Filter State
  searchQuery = '';
  selectedType = '';

  // Admin/Promoter Mode
  isPromoterMode = false;
  showForm = false;
  isSubmitting = false;

  // Form State
  newPromo = {
    title: '',
    description: '',
    propertyType: 'Villa',
    location: '',
    price: null as number | null,
    area: null as number | null,
    imageUrl: '',
    videoUrl: '',
    ownerName: '',
    ownerPhone: ''
  };

  editingPromo: any = null;

  // Interactive comments, likes, and copy-link share states
  commentUser: { [key: string]: string } = {};
  commentText: { [key: string]: string } = {};
  likedPromotions: string[] = [];
  copiedPromoId: string | null = null;

  ngOnInit(): void {
    this.fetchPromotions();
    const storedLikes = localStorage.getItem('construct_ease_liked_promos');
    if (storedLikes) {
      this.likedPromotions = JSON.parse(storedLikes);
    }
  }

  fetchPromotions(): void {
    this.isLoading = true;
    this.error = false;
    this.apiService.getPromotions().subscribe({
      next: (data) => {
        this.promotions = data.map((promo: any) => {
          if (promo.propertyType === 'Land' && !promo.videoUrl) {
            promo.videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-green-field-and-trees-40431-large.mp4';
          }
          return promo;
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching promotions:', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredPromotions = this.promotions.filter(promo => {
      const matchesSearch = 
        promo.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        promo.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        promo.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesType = !this.selectedType || promo.propertyType === this.selectedType;

      return matchesSearch && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  togglePromoterMode(): void {
    this.isPromoterMode = !this.isPromoterMode;
    this.cancelEdit();
    this.showForm = false;
  }

  // Handle local image and video uploads -> convert to Base64
  onFileSelected(event: any, mediaType: 'image' | 'video', mode: 'new' | 'edit'): void {
    const file = event.target.files[0];
    if (!file) return;

    // Optional validation
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    // Limit video size in base64 (e.g. 15MB) to avoid browser freeze
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB. Please upload a smaller video/image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (mode === 'new') {
        if (mediaType === 'image') this.newPromo.imageUrl = base64String;
        if (mediaType === 'video') this.newPromo.videoUrl = base64String;
      } else {
        if (mediaType === 'image') this.editingPromo.imageUrl = base64String;
        if (mediaType === 'video') this.editingPromo.videoUrl = base64String;
      }
    };
    reader.readAsDataURL(file);
  }

  savePromotion(): void {
    if (!this.newPromo.title || !this.newPromo.description || !this.newPromo.location || 
        !this.newPromo.price || !this.newPromo.area || !this.newPromo.ownerName || !this.newPromo.ownerPhone) {
      alert('Please fill out all required fields.');
      return;
    }

    if (this.newPromo.propertyType === 'Land' && !this.newPromo.videoUrl) {
      this.newPromo.videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-green-field-and-trees-40431-large.mp4';
    }

    this.isSubmitting = true;
    this.apiService.createPromotion(this.newPromo).subscribe({
      next: (saved) => {
        this.promotions.unshift(saved);
        this.applyFilters();
        this.resetNewForm();
        this.showForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating promotion:', err);
        alert('Failed to save promotion. Make sure fields are correct.');
        this.isSubmitting = false;
      }
    });
  }

  startEdit(promo: any): void {
    this.editingPromo = { ...promo };
    this.showForm = false; // Hide create form
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingPromo = null;
  }

  updatePromotion(): void {
    if (!this.editingPromo.title || !this.editingPromo.description || !this.editingPromo.location || 
        !this.editingPromo.price || !this.editingPromo.area || !this.editingPromo.ownerName || !this.editingPromo.ownerPhone) {
      alert('Please fill out all required fields.');
      return;
    }

    if (this.editingPromo.propertyType === 'Land' && !this.editingPromo.videoUrl) {
      this.editingPromo.videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-green-field-and-trees-40431-large.mp4';
    }

    this.isSubmitting = true;
    this.apiService.updatePromotion(this.editingPromo._id, this.editingPromo).subscribe({
      next: (updated) => {
        const index = this.promotions.findIndex(p => p._id === updated._id);
        if (index !== -1) {
          this.promotions[index] = updated;
          this.applyFilters();
        }
        this.cancelEdit();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating promotion:', err);
        alert('Failed to update promotion.');
        this.isSubmitting = false;
      }
    });
  }

  deletePromotion(id: string): void {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    this.apiService.deletePromotion(id).subscribe({
      next: () => {
        this.promotions = this.promotions.filter(p => p._id !== id);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error deleting promotion:', err);
        alert('Failed to delete promotion.');
      }
    });
  }
  likePromotion(promo: any): void {
    this.apiService.likePromotion(promo._id).subscribe({
      next: (updated) => {
        promo.likes = updated.likes;
      },
      error: (err) => {
        console.error('Error liking promotion:', err);
      }
    });
  }

  toggleMedia(promo: any): void {
    if (promo.imageUrl && promo.videoUrl) {
      promo.showingVideo = !promo.showingVideo;
    }
  }

  isLiked(promoId: string): boolean {
    return this.likedPromotions.includes(promoId);
  }

  toggleLike(promo: any): void {
    const promoId = promo._id;
    if (this.likedPromotions.includes(promoId)) {
      this.likedPromotions = this.likedPromotions.filter(id => id !== promoId);
      localStorage.setItem('construct_ease_liked_promos', JSON.stringify(this.likedPromotions));
      promo.likes = Math.max(0, promo.likes - 1);
    } else {
      this.likedPromotions.push(promoId);
      localStorage.setItem('construct_ease_liked_promos', JSON.stringify(this.likedPromotions));
      this.likePromotion(promo);
    }
  }

  toggleComments(promo: any): void {
    promo.showComments = !promo.showComments;
  }

  submitComment(promo: any): void {
    const username = this.commentUser[promo._id]?.trim();
    const text = this.commentText[promo._id]?.trim();

    if (!username || !text) {
      alert('Please enter your name and comment/inquiry text.');
      return;
    }

    this.apiService.addComment(promo._id, username, text).subscribe({
      next: (updated) => {
        promo.comments = updated.comments;
        this.commentText[promo._id] = ''; // clear input
      },
      error: (err) => {
        console.error('Error submitting comment:', err);
        alert('Failed to post comment. Make sure server is running.');
      }
    });
  }

  sharePromo(promo: any): void {
    const url = `${window.location.origin}/#/promote?id=${promo._id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copiedPromoId = promo._id;
      setTimeout(() => {
        if (this.copiedPromoId === promo._id) {
          this.copiedPromoId = null;
        }
      }, 3000);
    });
  }

  // Generates dynamic WhatsApp click URL redirecting to direct chat
  getWhatsAppUrl(promo: any): string {
    const cleanPhone = promo.ownerPhone.replace(/\D/g, ''); // Extract digits
    const message = `Hello ${promo.ownerName}! I am interested in buying your property '${promo.title}' in ${promo.location} that I saw promoted on Construct Ease. Can you please share more details?`;
    
    // Check if it's mobile or web-based redirection
    return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
  }

  resetNewForm(): void {
    this.newPromo = {
      title: '',
      description: '',
      propertyType: 'Villa',
      location: '',
      price: null,
      area: null,
      imageUrl: '',
      videoUrl: '',
      ownerName: '',
      ownerPhone: ''
    };
  }
}
