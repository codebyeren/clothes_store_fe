import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule,RouterModule]
})
export class HeaderComponent implements OnDestroy {
  isLoggedIn = false;
  private sub: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.sub = this.authService.isLoggedIn$.subscribe(val => {
      this.isLoggedIn = val;
    });
  }

  logout() {
    this.authService.logout();
  }

  onAccountClick() {
    this.router.navigate(['/auth/login']);
  }

  onSearch(productName: string) {
    if (productName && productName.trim()) {
      this.router.navigate(['search'], { queryParams: { productName } });
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
