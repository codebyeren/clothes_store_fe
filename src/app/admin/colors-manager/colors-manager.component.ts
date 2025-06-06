import {Component, Input, OnInit} from '@angular/core';
import { Color } from '../../shared/models/product.model';
import { ColorService } from '../../services/color.service';
import {NgFor} from '@angular/common';

import {AddColorComponent} from '../add-color/add-color.component';
import {MatDialog} from '@angular/material/dialog';
import {EditColorComponent} from '../edit-color/edit-color.component';

@Component({
  selector: 'app-colors-manager',
  templateUrl: './colors-manager.component.html',
  imports: [
    NgFor
  ],
  styleUrls: ['./colors-manager.component.css']
})
export class ColorsManagerComponent implements OnInit {
  @Input() colors: Color[] = [];

  constructor(private colorService: ColorService,
              public  dialog : MatDialog) {}

  ngOnInit(): void {

    this.colorService.getAllColors().subscribe(data =>
      this.colors = data);
  }

  openAddColor() {
    this.dialog.open(AddColorComponent, {
      width: '50vw',
    });
  }
  openUpdateColor(color : any){
    this.dialog.open(EditColorComponent,{
      width : '50vw',
      data : {color}
    })
  }
  deleteColor(id: number): void {
    if (confirm('Bạn có chắc muốn xoá màu này không?')) {
      this.colorService.deleteColor(id).subscribe(() => {
        this.colorService.getAllColors().subscribe(data => {
          this.colors = data;
        });
      });
    }
  }

}
