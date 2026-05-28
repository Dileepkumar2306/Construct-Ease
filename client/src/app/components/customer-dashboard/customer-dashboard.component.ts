import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css'
})
export class CustomerDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  
  area: number | null = null;
  quality: string = 'standard';
  selectedBhk: string | null = null;
  
  isEstimating = false;
  estimateResult: any = null;
  estimateError = false;

  isLoadingTemplates = true;
  templates: any[] = [];
  templatesError = false;

  // Portfolio / Inspiration Board variables
  portfolioItems: any[] = [];
  isLoadingPortfolio = false;
  portfolioError = false;
  showForm = false;
  isSubmitting = false;

  newPortfolioItem = {
    title: '',
    description: '',
    role: 'customer',
    category: 'idea',
    imageUrl: '',
    author: 'House Owner'
  };

  editingItem: any = null;

  ngOnInit() {
    this.apiService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.isLoadingTemplates = false;
      },
      error: (err) => {
        this.templatesError = true;
        this.isLoadingTemplates = false;
      }
    });
    this.fetchPortfolio();
  }

  fetchPortfolio() {
    this.isLoadingPortfolio = true;
    this.portfolioError = false;
    this.apiService.getPortfolio('customer').subscribe({
      next: (data) => {
        this.portfolioItems = data;
        this.isLoadingPortfolio = false;
      },
      error: (err) => {
        console.error("Error loading portfolio items:", err);
        this.portfolioError = true;
        this.isLoadingPortfolio = false;
      }
    });
  }

  calculateCost() {
    if (!this.area) return;
    
    this.isEstimating = true;
    this.estimateResult = null;
    this.estimateError = false;

    this.apiService.estimateCost(this.area, this.quality).subscribe({
      next: (res) => {
        this.estimateResult = res;
        this.isEstimating = false;
      },
      error: (err) => {
        this.estimateError = true;
        this.isEstimating = false;
      }
    });
  }

  selectBhk(type: string) {
    this.selectedBhk = this.selectedBhk === type ? null : type;
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
      alert("Please fill in all fields and select or link an image!");
      return;
    }

    this.isSubmitting = true;
    this.apiService.createPortfolioItem(this.newPortfolioItem).subscribe({
      next: (res) => {
        this.portfolioItems.unshift(res);
        this.newPortfolioItem = {
          title: '',
          description: '',
          role: 'customer',
          category: 'idea',
          imageUrl: '',
          author: 'House Owner'
        };
        this.showForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to save inspiration item.");
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
    if (confirm("Are you sure you want to delete this item?")) {
      this.apiService.deletePortfolioItem(id).subscribe({
        next: () => {
          this.portfolioItems = this.portfolioItems.filter(p => p._id !== id);
        },
        error: (err) => {
          console.error(err);
          alert("Failed to delete item.");
        }
      });
    }
  }
}

