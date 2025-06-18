import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatBubbleComponent } from './components/chat-bubble/chat-bubble.component';
import { routes } from './app.routes';
import { ScrollService } from './services/scroll.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatBubbleComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showHeaderFooter = true;
  isUserLoggedIn = false;

  constructor(
    private router: Router,
    private scrollService: ScrollService,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeaderFooter = !event.url.startsWith('/admin');
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isUserLoggedIn = isLoggedIn;
    });
  }
}