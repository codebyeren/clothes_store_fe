import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discountPrice',
  standalone: true
})
export class DiscountPricePipe implements PipeTransform {
  transform(price: number, discount: number | undefined): number {
    if (!discount) return price;
    return price - (price * discount / 100);
  }
} 