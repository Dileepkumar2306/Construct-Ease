import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-builder-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './builder-dashboard.component.html',
  styleUrl: './builder-dashboard.component.css'
})
export class BuilderDashboardComponent implements OnInit {
  public apiService = inject(ApiService);

  // Estimator State
  area: number | null = null;
  quality: string = 'standard';
  isEstimating = false;
  estimateResult: any = null;
  estimateError = false;

  // Portfolio / Projects State
  portfolioItems: any[] = [];
  isLoadingPortfolio = false;
  portfolioError = false;
  showForm = false;
  isSubmitting = false;

  newPortfolioItem = {
    title: '',
    description: '',
    role: 'builder',
    category: 'construction',
    imageUrl: '',
    author: 'Elite Construction Builders'
  };

  editingItem: any = null;

  ngOnInit() {
    this.fetchPortfolio();
  }

  calculateEstimate() {
    if (!this.area) {
      alert("Please enter a built-up area!");
      return;
    }
    
    this.isEstimating = true;
    this.estimateResult = null;
    this.estimateError = false;

    this.apiService.estimateCost(this.area, this.quality).subscribe({
      next: (res) => {
        this.estimateResult = res;
        this.isEstimating = false;
      },
      error: (err) => {
        console.error(err);
        this.estimateError = true;
        this.isEstimating = false;
      }
    });
  }

  fetchPortfolio() {
    this.isLoadingPortfolio = true;
    this.portfolioError = false;
    this.apiService.getPortfolio('builder').subscribe({
      next: (data) => {
        this.portfolioItems = data;
        this.isLoadingPortfolio = false;
      },
      error: (err) => {
        console.error("Error loading builder portfolio:", err);
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
      alert("Please fill in all fields and choose a project image!");
      return;
    }

    this.isSubmitting = true;
    this.apiService.createPortfolioItem(this.newPortfolioItem).subscribe({
      next: (res) => {
        this.portfolioItems.unshift(res);
        this.newPortfolioItem = {
          title: '',
          description: '',
          role: 'builder',
          category: 'construction',
          imageUrl: '',
          author: 'Elite Construction Builders'
        };
        this.showForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to save project updates.");
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
    if (confirm("Are you sure you want to delete this construction project?")) {
      this.apiService.deletePortfolioItem(id).subscribe({
        next: () => {
          this.portfolioItems = this.portfolioItems.filter(p => p._id !== id);
        },
        error: (err) => {
          console.error(err);
          alert("Failed to delete project.");
        }
      });
    }
  }
}
