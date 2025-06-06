import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CartDropdownComponent } from '../cart-dropdown/cart-dropdown.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, CartDropdownComponent]
})
export class HeaderComponent implements OnDestroy {
  isLoggedIn = false;
  showCartDropdown: boolean = false;
  private sub: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.sub = this.authService.isLoggedIn$.subscribe(val => {
      this.isLoggedIn = val;
    });
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/auth/login']);
  }

  onAccountClick() {
    this.router.navigate(['/user/profile']);
  }

  onSearch(productName: string) {
    if (productName && productName.trim()) {
      this.router.navigate(['search'], { queryParams: { productName } });
    }
  }

  toggleCartDropdown() {
    this.showCartDropdown = !this.showCartDropdown;
    console.log('toggleCartDropdown called. showCartDropdown is now:', this.showCartDropdown);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
