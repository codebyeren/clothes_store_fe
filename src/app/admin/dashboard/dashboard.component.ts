import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardData, DashboardService } from '../../services/dashboard.service';
import { NgChartsModule } from 'ng2-charts';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    NgChartsModule,
    NgIf,
    DecimalPipe,
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalIncome: number = 0;
  totalOrder: number = 0;
  isLoading = true;
  totalIncomeByYear: number = 0;

  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];

  topProductsByCategory: { category: string; products: any[] }[] = [];

  selectedCategory: { category: string; products: any[] } | null = null;

  originalRevenueChart: { date: string; total: number }[] = [];

  revenueChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  revenueChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return value.toLocaleString('vi-VN') + ' ₫';
          }
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.totalIncome = data.totalIncome;
        this.totalOrder = data.totalOrder;
        this.topProductsByCategory = data.topProductsByParentCategory;
        this.originalRevenueChart = data.revenueChart || [];

        const years = new Set<number>();
        this.originalRevenueChart.forEach(item => {
          const year = new Date(item.date).getFullYear();
          years.add(year);
        });
        this.availableYears = Array.from(years).sort((a, b) => b - a);
        this.selectedYear = this.availableYears[0];

        if (this.topProductsByCategory.length > 0) {
          this.selectedCategory = this.topProductsByCategory[0];
        }

        this.filterRevenueByYear();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.isLoading = false;
      }
    });
  }

  filterRevenueByYear(): void {
    const monthlyRevenue = new Array(12).fill(0);

    this.originalRevenueChart.forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear();

      if (year === this.selectedYear) {
        const monthIndex = date.getMonth();
        monthlyRevenue[monthIndex] += item.total;
      }
    });

    this.revenueChartData = {
      labels: [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ],
      datasets: [
        {
          label: 'Doanh thu',
          data: monthlyRevenue,
          backgroundColor: '#4e73df'
        }
      ]
    };

    this.totalIncomeByYear = monthlyRevenue.reduce((sum, value) => sum + value, 0);
  }


  selectCategory(category: { category: string; products: any[] }) {
    this.selectedCategory = category;
  }

}
