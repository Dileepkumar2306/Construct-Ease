import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-interior-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interior-studio.component.html',
  styleUrl: './interior-studio.component.css'
})
export class InteriorStudioComponent implements OnInit {
  private apiService = inject(ApiService);
  
  activeTab: string = 'estimator'; // 'estimator', 'vendors', 'professionals', 'portfolio'

  // Estimator State
  area: number | null = null;
  style: string = 'modern';
  quality: string = 'standard';
  isEstimating = false;
  estimateResult: any = null;
  estimateError = false;

  // Vendors State
  vendors: any[] = [];
  isLoadingVendors = false;

  // Professionals State
  professionals: any[] = [];
  isLoadingProfessionals = false;

  // Studio Portfolio State (CRUD)
  portfolioItems: any[] = [];
  isLoadingPortfolio = false;
  portfolioError = false;
  showForm = false;
  isSubmitting = false;

  newPortfolioItem = {
    title: '',
    description: '',
    role: 'interior',
    category: 'interior_design',
    imageUrl: '',
    author: 'Heritage Craft Interiors'
  };

  editingItem: any = null;

  ngOnInit() {
    this.fetchVendors();
    this.fetchProfessionals();
    this.fetchPortfolio();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  calculateInteriorCost() {
    if (!this.area) return;
    this.isEstimating = true;
    this.estimateError = false;
    this.estimateResult = null;

    this.apiService.estimateInteriorCost(this.area, this.style, this.quality).subscribe({
      next: (res) => {
        this.estimateResult = res;
        this.isEstimating = false;
      },
      error: () => {
        this.estimateError = true;
        this.isEstimating = false;
      }
    });
  }

  fetchVendors() {
    this.isLoadingVendors = true;
    this.apiService.getVendors().subscribe({
      next: (res) => {
        this.vendors = res;
        this.isLoadingVendors = false;
      },
      error: () => {
        this.isLoadingVendors = false;
      }
    });
  }

  @HostListener('window:locationChanged', ['$event'])
  onLocationChanged(event: any) {
    this.fetchProfessionals();
  }

  fetchProfessionals() {
    this.isLoadingProfessionals = true;
    this.apiService.getProfessionals(this.apiService.activeLocation).subscribe({
      next: (res) => {
        this.professionals = res;
        this.isLoadingProfessionals = false;
      },
      error: () => {
        this.isLoadingProfessionals = false;
      }
    });
  }

  // Portfolio CRUD Methods
  fetchPortfolio() {
    this.isLoadingPortfolio = true;
    this.portfolioError = false;
    this.apiService.getPortfolio('interior').subscribe({
      next: (data) => {
        this.portfolioItems = data;
        this.isLoadingPortfolio = false;
      },
      error: (err) => {
        console.error("Error loading interior portfolio:", err);
        this.portfolioError = true;
        this.isLoadingPortfolio = false;
      }
    });
  }

  onFileSelected(event: any, target: 'new' | 'edit' = 'new') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (target === 'new') {
          this.newPortfolioItem.imageUrl = reader.result as string;
        } else if (this.editingItem) {
          this.editingItem.imageUrl = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  savePortfolioItem() {
    if (!this.newPortfolioItem.title || !this.newPortfolioItem.description || !this.newPortfolioItem.imageUrl) {
      alert("Please fill in all fields and choose a design photo!");
      return;
    }

    this.isSubmitting = true;
    this.apiService.createPortfolioItem(this.newPortfolioItem).subscribe({
      next: (res) => {
        this.portfolioItems.unshift(res);
        this.newPortfolioItem = {
          title: '',
          description: '',
          role: 'interior',
          category: 'interior_design',
          imageUrl: '',
          author: 'Heritage Craft Interiors'
        };
        this.showForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to save design concept.");
        this.isSubmitting = false;
      }
    });
  }

  startEdit(item: any) {
    this.editingItem = { ...item };
  }

  cancelEdit() {
    this.editingItem = null;
  }

  updatePortfolioItem() {
    if (!this.editingItem.title || !this.editingItem.description || !this.editingItem.imageUrl) {
      alert("Please fill in all fields!");
      return;
    }

    this.isSubmitting = true;
    this.apiService.updatePortfolioItem(this.editingItem._id, this.editingItem).subscribe({
      next: (res) => {
        const index = this.portfolioItems.findIndex(p => p._id === this.editingItem._id);
        if (index !== -1) {
          this.portfolioItems[index] = res;
        }
        this.editingItem = null;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to update item.");
        this.isSubmitting = false;
      }
    });
  }

  deleteItem(id: string) {
    if (confirm("Are you sure you want to delete this interior design layout?")) {
      this.apiService.deletePortfolioItem(id).subscribe({
        next: () => {
          this.portfolioItems = this.portfolioItems.filter(p => p._id !== id);
        },
        error: (err) => {
          console.error(err);
          alert("Failed to delete design.");
        }
      });
    }
  }
}
