import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
// import { VerifyPhoneComponent } from './auth/verify-phone/verify-phone.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

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
    path: 'products/category/:categoryId',
    loadComponent: () => import('./user/product-category/product-category.component').then(m => m.ProductCategoryComponent)
  },
  {
    path: 'product/:id',
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
