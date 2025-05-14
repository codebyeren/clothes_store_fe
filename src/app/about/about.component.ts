import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-about',

  imports: [NgIf],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  showMore = false;

  toggleMore() {
    this.showMore = !this.showMore;
  }
}
