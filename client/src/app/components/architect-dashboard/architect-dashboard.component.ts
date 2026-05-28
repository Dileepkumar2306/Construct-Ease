import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-architect-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './architect-dashboard.component.html',
  styleUrl: './architect-dashboard.component.css'
})
export class ArchitectDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  portfolioItems: any[] = [];
  isLoadingPortfolio = false;
  portfolioError = false;
  showForm = false;
  isSubmitting = false;

  newPortfolioItem = {
    title: '',
    description: '',
    role: 'architect',
    category: 'design',
    imageUrl: '',
    author: 'Ar. Raghav Rao'
  };

  editingItem: any = null;

  // Template Uploader State
  newTemplate = {
    name: '',
    area: null as number | null,
    style: 'Modern',
    image_url: ''
  };
  isUploadingTemplate = false;

  // Predefined Templates State
  templates: any[] = [];
  isLoadingTemplates = false;
  templatesError = false;

  ngOnInit() {
    this.fetchPortfolio();
    this.fetchTemplates();
  }

  fetchPortfolio() {
    this.isLoadingPortfolio = true;
    this.portfolioError = false;
    this.apiService.getPortfolio('architect').subscribe({
      next: (data) => {
        this.portfolioItems = data;
        this.isLoadingPortfolio = false;
      },
      error: (err) => {
        console.error("Error loading architect portfolio items:", err);
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
      alert("Please fill in all fields and choose a design image!");
      return;
    }

    this.isSubmitting = true;
    this.apiService.createPortfolioItem(this.newPortfolioItem).subscribe({
      next: (res) => {
        this.portfolioItems.unshift(res);
        this.newPortfolioItem = {
          title: '',
          description: '',
          role: 'architect',
          category: 'design',
          imageUrl: '',
          author: 'Ar. Raghav Rao'
        };
        this.showForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to save architectural design.");
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
    if (confirm("Are you sure you want to delete this design?")) {
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

  onTemplateFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newTemplate.image_url = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadTemplate() {
    if (!this.newTemplate.name || !this.newTemplate.area || !this.newTemplate.image_url) {
      alert("Please fill in all template fields and choose a design image!");
      return;
    }

    this.isUploadingTemplate = true;
    this.apiService.uploadTemplate(this.newTemplate).subscribe({
      next: (res) => {
        alert("Template uploaded successfully!");
        this.newTemplate = {
          name: '',
          area: null,
          style: 'Modern',
          image_url: ''
        };
        this.isUploadingTemplate = false;
        this.fetchTemplates();
      },
      error: (err) => {
        console.error(err);
        alert("Failed to upload template.");
        this.isUploadingTemplate = false;
      }
    });
  }

  fetchTemplates() {
    this.isLoadingTemplates = true;
    this.templatesError = false;
    this.apiService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.isLoadingTemplates = false;
      },
      error: (err) => {
        console.error("Error loading templates:", err);
        this.templatesError = true;
        this.isLoadingTemplates = false;
      }
    });
  }

  deleteTemplate(id: string) {
    if (confirm("Are you sure you want to delete this template?")) {
      this.apiService.deleteTemplate(id).subscribe({
        next: () => {
          this.fetchTemplates();
        },
        error: (err) => {
          console.error(err);
          alert("Failed to delete template.");
        }
      });
    }
  }
}
