import { Component, OnInit, inject, HostListener } from '@angular/core';
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
  bhkDetails: any = null;
  selectedTemplate: any = null;
  
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

  // Professionals Finder variables
  searchLocation: string = '';
  selectedRoleFilter: string = 'All';
  isDetectingLocation: boolean = false;
  locationError: string | null = null;
  
  isLoadingProfessionals: boolean = false;
  professionalsList: any[] = [];
  professionalsError: boolean = false;

  // Contact modal variables
  selectedProfessional: any = null;
  showContactModal: boolean = false;
  inquirySubmitted: boolean = false;
  isInquirySubmitting: boolean = false;
  inquiryForm = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    projectArea: null as number | null,
    message: ''
  };

  @HostListener('window:locationChanged', ['$event'])
  onLocationChanged(event: any) {
    this.searchLocation = event.detail;
    this.fetchProfessionals();
  }

  ngOnInit() {
    this.searchLocation = this.apiService.activeLocation;
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

    this.apiService.getBhkDetails().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const map: { [key: string]: any } = {};
          data.forEach((item: any) => {
            map[item.bhkType] = item;
          });
          this.bhkDetailsData = map;
        }
      },
      error: (err) => {
        console.error("Failed to load BHK details from database. Falling back to local copy.", err);
      }
    });

    this.fetchPortfolio();
    this.fetchProfessionals();
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

  bhkDetailsData: { [key: string]: any } = {
    '1BHK': {
      title: '1 BHK — Compact & Smart Living Plan',
      areaRange: '400 - 700 Sq.Ft.',
      duration: '4 - 6 Months',
      rooms: [
        { name: 'Living Room', size: '14 x 12 ft', description: 'Welcoming space with provisions for TV unit, sofa set, and natural lighting.' },
        { name: 'Master Bedroom', size: '12 x 10 ft', description: 'Cozy bedroom layout with built-in wardrobe slots and attached window ventilation.' },
        { name: 'Kitchen', size: '8 x 8 ft', description: 'L-shaped granite countertop platform with sink and gas outlet.' },
        { name: 'Bathroom', size: '7 x 5 ft', description: 'Equipped with standard sanitary ware, water heater provisions, and anti-skid tiling.' }
      ],
      materials: {
        cement: '320 Bags',
        steel: '2.5 Tons',
        sand: '780 CFT (Cubic Feet)',
        aggregate: '920 CFT',
        bricks: '6,200 Pcs'
      },
      specifications: [
        'Vitrified tile flooring (2x2 ft) in all rooms.',
        'Flush doors with teak wood frames for main entrance.',
        'UPVC sliding windows with safety grills.',
        'Single-phase electrical connection with 25 modular switch points.'
      ]
    },
    '2BHK': {
      title: '2 BHK — Comfort & Family Lifestyle Plan',
      areaRange: '800 - 1200 Sq.Ft.',
      duration: '6 - 8 Months',
      rooms: [
        { name: 'Living & Dining Room', size: '18 x 12 ft', description: 'Generous area designed for family gatherings, TV setup, and 6-seater dining table.' },
        { name: 'Master Bedroom', size: '14 x 12 ft', description: 'Spacious room with attached balcony and modern master bath suite.' },
        { name: 'Kids Bedroom', size: '12 x 10 ft', description: 'Perfect room layout for kids or home-office setup with study alcove.' },
        { name: 'Kitchen', size: '10 x 8 ft', description: 'Parallel modular platform layout with utility area for washing machine.' },
        { name: 'Common Bath & Toilet', size: '7 x 5 ft', description: 'Conveniently accessible bath with anti-skid ceramic tiles.' }
      ],
      materials: {
        cement: '520 Bags',
        steel: '4.5 Tons',
        sand: '1,300 CFT (Cubic Feet)',
        aggregate: '1,600 CFT',
        bricks: '11,000 Pcs'
      },
      specifications: [
        'Double-charged vitrified tile flooring in living & bedrooms.',
        'Pre-laminated flush doors and teak wood main door.',
        '3-track aluminum sliding windows with mosquito mesh.',
        'AC provisions in Master Bedroom, 45 electrical points.'
      ]
    },
    '3BHK': {
      title: '3 BHK — Elite & Spacious Premium Plan',
      areaRange: '1200 - 1800 Sq.Ft.',
      duration: '8 - 10 Months',
      rooms: [
        { name: 'Spacious Living Room', size: '20 x 14 ft', description: 'Grand lounge area overlooking balcony, ideal for L-shaped sofas and entertainment console.' },
        { name: 'Master Bedroom Suite', size: '15 x 12 ft', description: 'Luxury suite featuring walk-in wardrobe, wooden flooring, and private balcony.' },
        { name: 'Parents Bedroom', size: '13 x 11 ft', description: 'Comfortable double bedroom layout with attached modular bathroom.' },
        { name: 'Guest Bedroom', size: '12 x 10 ft', description: 'Versatile room layout with sliding wardrobe slot and large windows.' },
        { name: 'Modular Kitchen & Utility', size: '12 x 8 ft', description: 'Modern kitchen space with chimney provision and washing machine wash area.' }
      ],
      materials: {
        cement: '780 Bags',
        steel: '6.8 Tons',
        sand: '1,900 CFT (Cubic Feet)',
        aggregate: '2,300 CFT',
        bricks: '16,500 Pcs'
      },
      specifications: [
        'Premium vitrified flooring. Engineered wood flooring in Master Bedroom.',
        'Teak wood main door and waterproof flush doors for toilets.',
        'UPVC soundproof windows with safety grills.',
        'Modular switches with concealed copper wiring (65+ points).'
      ]
    },
    '4BHK': {
      title: '4 BHK — Imperial Villa & Grand Residency Plan',
      areaRange: '2000 - 3500 Sq.Ft.',
      duration: '12 - 14 Months',
      rooms: [
        { name: 'Grand Entrance & Living', size: '22 x 15 ft', description: 'High-ceiling lounge welcoming guests with marble styling and natural skylights.' },
        { name: 'Imperial Master Suite', size: '18 x 14 ft', description: 'Palatial bedroom with private lounge terrace, dressing room, and rain-shower bath.' },
        { name: 'Kids Suite & Study', size: '14 x 12 ft', description: 'Large bedroom suite on the first floor with integrated study desk and storage.' },
        { name: 'Parents Ground Suite', size: '14 x 12 ft', description: 'Elder-friendly ground floor layout with immediate access to lawns.' },
        { name: 'Guest Suite', size: '12 x 11 ft', description: 'Quiet double bedroom on first floor for visitors.' },
        { name: 'Gourmet Kitchen & Pantry', size: '16 x 10 ft', description: 'State-of-the-art kitchen space with separate store pantry and breakfast counter.' }
      ],
      materials: {
        cement: '1,450 Bags',
        steel: '12.5 Tons',
        sand: '3,600 CFT (Cubic Feet)',
        aggregate: '4,400 CFT',
        bricks: '29,000 Pcs'
      },
      specifications: [
        'Italian marble flooring in Living/Dining; laminated wooden in master bedroom.',
        'Designer teak wood carved main door, panelled doors inside.',
        'Double-glazed UPVC glass sliding panels for balconies.',
        'Three-phase power connection with smart automation console provision.'
      ]
    }
  };

  selectBhk(type: string) {
    if (this.selectedBhk === type) {
      this.selectedBhk = null;
      this.bhkDetails = null;
    } else {
      this.selectedBhk = type;
      this.bhkDetails = this.bhkDetailsData[type];
      
      // Auto-scroll to detail panel
      setTimeout(() => {
        const el = document.getElementById('bhk-detail-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  loadBhkIntoEstimator(bhkType: string) {
    const areaMap: { [key: string]: number } = {
      '1BHK': 550,
      '2BHK': 1000,
      '3BHK': 1500,
      '4BHK': 2800
    };
    this.area = areaMap[bhkType] || 1000;
    this.calculateCost();
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }

  viewTemplateDetails(template: any) {
    const roomCount = template.bedrooms || (template.area < 1000 ? '2' : template.area < 2000 ? '3' : '4');
    const durationVal = template.duration || (template.area < 1000 ? '5 Months' : template.area < 2000 ? '8 Months' : '12 Months');
    const highlightsVal = template.highlights && template.highlights.length > 0 ? template.highlights : [
      'Premium cross-ventilation layout',
      'Vastu-compliant entrance and kitchen positioning',
      'Double-glazed window paneling for maximum soundproofing',
      'Spacious modular kitchen utility area'
    ];
    const materialsVal = template.materials && template.materials.cement ? template.materials : {
      cement: Math.ceil(template.area * 0.5) + ' Bags',
      steel: (template.area * 0.0045).toFixed(1) + ' Tons',
      sand: Math.ceil(template.area * 1.35) + ' CFT',
      aggregate: Math.ceil(template.area * 1.65) + ' CFT',
      bricks: Math.ceil(template.area * 10) + ' Pcs'
    };

    this.selectedTemplate = {
      ...template,
      bedrooms: roomCount,
      duration: durationVal,
      highlights: highlightsVal,
      materials: materialsVal
    };
  }

  closeTemplateModal() {
    this.selectedTemplate = null;
  }

  useTemplateInEstimator(template: any) {
    this.area = template.area;
    this.calculateCost();
    this.closeTemplateModal();
    window.scrollTo({ top: 100, behavior: 'smooth' });
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

  fetchProfessionals() {
    this.isLoadingProfessionals = true;
    this.professionalsError = false;
    this.apiService.getProfessionalsList(this.searchLocation, this.selectedRoleFilter).subscribe({
      next: (data) => {
        this.professionalsList = data;
        this.isLoadingProfessionals = false;
      },
      error: (err) => {
        console.error("Error loading professionals:", err);
        this.professionalsError = true;
        this.isLoadingProfessionals = false;
      }
    });
  }

  detectLocation() {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser.';
      return;
    }

    this.isDetectingLocation = true;
    this.locationError = null;

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
                this.searchLocation = city;
                this.fetchProfessionals();
              } else {
                this.locationError = 'Could not determine city name. Please enter manually.';
              }
            } else {
              this.locationError = 'Could not resolve location. Please enter manually.';
            }
          })
          .catch((err) => {
            console.error("Reverse geocoding error:", err);
            this.isDetectingLocation = false;
            this.locationError = 'Geocoding service unavailable. Please enter manually.';
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        this.isDetectingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Permission denied. Please enter location manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location information unavailable. Please enter manually.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out. Please enter manually.';
            break;
          default:
            this.locationError = 'An unknown error occurred. Please enter manually.';
        }
      },
      { timeout: 10000 }
    );
  }

  openContactModal(professional: any) {
    this.selectedProfessional = professional;
    this.showContactModal = true;
    this.inquirySubmitted = false;
    this.inquiryForm = {
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      projectArea: this.area || null,
      message: `Hi, I am interested in consulting for my house construction. Let's discuss details.`
    };
  }

  closeContactModal() {
    this.showContactModal = false;
    this.selectedProfessional = null;
  }

  submitInquiry() {
    if (!this.inquiryForm.clientName || !this.inquiryForm.clientPhone || !this.inquiryForm.message) {
      alert("Please fill in Name, Phone and Message.");
      return;
    }

    const payload = {
      professionalId: this.selectedProfessional._id,
      clientName: this.inquiryForm.clientName,
      clientPhone: this.inquiryForm.clientPhone,
      clientEmail: this.inquiryForm.clientEmail,
      projectArea: this.inquiryForm.projectArea,
      message: this.inquiryForm.message
    };

    this.isInquirySubmitting = true;
    this.apiService.sendInquiry(payload).subscribe({
      next: (res) => {
        this.isInquirySubmitting = false;
        this.inquirySubmitted = true;
        setTimeout(() => {
          this.closeContactModal();
        }, 2000);
      },
      error: (err) => {
        console.error("Inquiry error:", err);
        alert("Failed to submit inquiry. Please try again.");
        this.isInquirySubmitting = false;
      }
    });
  }

  setRoleFilter(role: string) {
    this.selectedRoleFilter = role;
    this.fetchProfessionals();
  }
}

