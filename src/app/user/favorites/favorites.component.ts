import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { FavoriteService, FavoriteProductDTO } from '../../services/favorite.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, UserSidebarComponent, ProductBoxComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: FavoriteProductDTO[] = [];
  user: any = {};

  constructor(
    private favoriteService: FavoriteService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Load user info for sidebar
    this.userService.getUserInfo().subscribe(data => {
      this.user = data.data;
    });

    // Load favorites
    this.favoriteService.getFavorites().subscribe(favorites => {
      this.favorites = favorites;
    });
  }
} 