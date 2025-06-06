import { Component } from '@angular/core';
import {Product} from '../../shared/models/product.model';
import {DiscountService} from '../../services/discounts.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ProductService} from '../../services/product.service';
import {NgForOf} from '@angular/common';
import { Discount } from '../../shared/models/discount.model';

@Component({
  selector: 'app-discount-list',
  imports: [
    NgForOf
  ],
  templateUrl: './discount-list.component.html',
  styleUrl: './discount-list.component.css'
})
export class DiscountListComponent {
 product : Product [] = []
  discount : Discount [] = []
  constructor(
    private productService : ProductService,
    private discountService : DiscountService,
    private dialogRef: MatDialogRef<Discount>,
  ) {
  }
  ngOnInit() {
    this.loaddDiscont();
    this.loadProduct()
  }

  loadProduct() : void{
   this.productService.getHomeProducts().subscribe(data=>{
     this.product = data
   })
  }
  loaddDiscont() : void{
    this.discountService.getALlDisCount().subscribe(data=>{
      this.discount = data
    })
  }
}
