import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CartDropdownComponent } from '../cart-dropdown/cart-dropdown.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, CartDropdownComponent]
})
export class HeaderComponent implements OnDestroy, OnInit {
  isLoggedIn = false;
  showCartDropdown: boolean = false;
  private sub: Subscription;
  private routerSub: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) {
    this.sub = this.authService.isLoggedIn$.subscribe(val => {
      this.isLoggedIn = val;
    });
  }

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showCartDropdown = false;
    });
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showCartDropdown = false;
    this.router.navigate(['/auth/login']);
  }

  onAccountClick() {
    this.router.navigate(['/user/profile']);
  }


  onFavoritesClick() {
    this.router.navigate(['/user/favorites']);
  }

  onOrdersClick() {
    this.router.navigate(['/user/orders']);
  }

  onSearch(productName: string) {
    if (productName && productName.trim()) {
      this.router.navigate(['search'], { queryParams: { productName } });
    }
  }

  toggleCartDropdown() {
    this.showCartDropdown = !this.showCartDropdown;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
