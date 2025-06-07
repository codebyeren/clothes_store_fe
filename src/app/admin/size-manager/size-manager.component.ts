import {Component, Input} from '@angular/core';
import {NgForOf} from "@angular/common";

import {MatDialog} from '@angular/material/dialog';
import {AddColorComponent} from '../add-color/add-color.component';
import {EditColorComponent} from '../edit-color/edit-color.component';
import {SizeService} from '../../services/size.services';
import {SizeAdmin} from '../../shared/models/product.model';
import {AddSizeComponent} from '../add-size/add-size.component';
import {EditSizeComponent} from '../edit-size/edit-size.component';

@Component({
  selector: 'app-size-manager',
    imports: [
        NgForOf
    ],
  templateUrl: './size-manager.component.html',
  styleUrl: './size-manager.component.css'
})
export class SizeManagerComponent {
  @Input() sizes: SizeAdmin[] = [];

  constructor(private sizeService: SizeService,
              public  dialog : MatDialog) {}

  ngOnInit(): void {

   this.load()
  }

load() : void {
  this.sizeService.getAllSize().subscribe(data =>
    this.sizes = data);
}
  openAddSize() {
    const dialogRef = this.dialog.open(AddSizeComponent, {
      width: '50vw',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.load()

    });
  }
  openUpdateSize(size : any){
    const dialogRef = this.dialog.open(EditSizeComponent,{
      width : '50vw',
      data : {size}
    });
    dialogRef.afterClosed().subscribe(result => {
      this.load()

    });
  }
  deleteSize(id: number): void {
    if (confirm('Bạn có chắc muốn xoá màu này không?')) {
      this.sizeService.deleteSize(id).subscribe(() => {
        this.sizeService.getAllSize().subscribe(data => {
          this.sizes = data;
        });
      });
    }
  }

}
