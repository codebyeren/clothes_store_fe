import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
// import { VerifyPhoneComponent } from './auth/verify-phone/verify-phone.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
      },
      // {
      //   path: 'verify-phone',
      //   loadComponent: () => import('./auth/verify-phone/verify-phone.component').then(m => m.VerifyPhoneComponent)
      // },
      {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'products/category/:slug',
    loadComponent: () => import('./user/product-category/product-category.component').then(m => m.ProductCategoryComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./user/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./user/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./user/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./user/product-search/product-search.component').then(m => m.ProductSearchComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./user/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: 'product-manager',
        loadComponent: () => import('./admin/product-manager/product-manager.component').then(m => m.ProductManagerComponent)
      },
      {
        path: 'product-manager/:slug',
        loadComponent: () => import('./admin/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'add-product',
        loadComponent: () => import('./admin/add-product/add-product.component').then(m => m.AddProductComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./admin/colors-manager/colors-manager.component').then(m => m.ColorsManagerComponent)
      },
      {
        path: 'size',
        loadComponent: () => import('./admin/size-manager/size-manager.component').then(m => m.SizeManagerComponent)
      },
      {
        path: 'category',
        loadComponent: () => import('./admin/category-manager/category-manager.component').then(m => m.CategoryManagerComponent)
      },
      {
        path: 'order-manager',
        loadComponent: () => import('./admin/order-manager/order-manager.component').then(m => m.OrderManagerComponent)
      },
      {
        path: 'user',
        loadComponent: () => import('./admin/user-manager/user-manager.component').then(m => m.UserManagerComponent)
      },
      {
        path: 'dash',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dash',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./user/user-profile/user-profile.component').then(m => m.UserProfileComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./user/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'favorites',
        loadComponent: () => import('./user/favorites/favorites.component').then(m => m.FavoritesComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./user/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
