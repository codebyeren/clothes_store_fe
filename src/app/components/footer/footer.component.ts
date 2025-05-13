import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule]
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  emailSubscription: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  onSubscribe(): void {
    if (this.emailSubscription && this.validateEmail(this.emailSubscription)) {
      // Here you would typically call a service to handle the subscription
      console.log('Email subscription:', this.emailSubscription);
      // Reset the form
      this.emailSubscription = '';
      // You could add a success message or toast notification here
    } else {
      // Handle invalid email
      console.error('Invalid email address');
      // You could add an error message or toast notification here
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}
