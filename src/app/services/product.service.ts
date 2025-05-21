import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Product {
  id: number;
  productName: string;
  price: number;
  status: string;
  image_url : string;
  discount: number;
  img_list? : string[];

}

export interface ProductCategory {
  category: string;
  products: Product[];
}

export interface ProductResponse {
  message: string;
  data: ProductCategory[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() {}

  getProducts(): Observable<ProductResponse> {
    const mockData: ProductResponse = {
      message: 'Okkk',
      data: [
        {
          category: 'Quần áo nữ',
          products: [
            {
              id: 1,
              productName: 'Áo sơ mi nữ',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 199000,
              status: 'hàng mới',
              discount: 0,
              img_list : [
                'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
                'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
                'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg'
              ]
            },
            {
              id: 1,
              productName: 'Áo sơ mi nữ',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 199000,
              status: 'hàng mới',
              discount: 0
            },
            {
              id: 2,
              productName: 'Váy xòe',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 259000,
              status: 'hàng hot',
              discount: 10
            },
            {
              id: 3,
              productName: 'Áo len dài tay',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 179000,
              status: 'hàng mới',
              discount: 5
            }
          ]
        },
        {
          category: 'Quần áo nam',
          products: [
            {
              id: 4,
              productName: 'Áo thun nam',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 149000,
              status: 'hàng mới',
              discount: 0
            },
            {
              id: 5,
              productName: 'Quần jeans',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 299000,
              status: 'bán chạy',
              discount: 15
            },
            {
              id: 6,
              productName: 'Áo khoác bomber',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 399000,
              status: 'hàng mới',
              discount: 20
            }
          ]
        },
        {
          category: 'Giày dép',
          products: [
            {
              id: 7,
              productName: 'Giày sneaker',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 499000,
              status: 'hàng mới',
              discount: 5
            },
            {
              id: 8,
              productName: 'Dép quai hậu',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 199000,
              status: 'bán chạy',
              discount: 10
            },
            {
              id: 9,
              productName: 'Giày lười',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 399000,
              status: 'hàng mới',
              discount: 0
            }
          ]
        },
        {
          category: 'Phụ kiện',
          products: [
            {
              id: 10,
              productName: 'Mũ bucket',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 99000,
              status: 'hàng mới',
              discount: 0
            },
            {
              id: 11,
              productName: 'Túi đeo chéo',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 159000,
              status: 'bán chạy',
              discount: 5
            },
            {
              id: 12,
              productName: 'Kính râm',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 129000,
              status: 'hàng hot',
              discount: 10
            }
          ]
        },
        {
          category: 'Đồ thể thao',
          products: [
            {
              id: 13,
              productName: 'Áo bóng đá',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 199000,
              status: 'hàng mới',
              discount: 0
            },
            {
              id: 14,
              productName: 'Quần thể thao',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 179000,
              status: 'hàng mới',
              discount: 5
            },
            {
              id: 15,
              productName: 'Giày chạy bộ',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 599000,
              status: 'bán chạy',
              discount: 15
            }
          ]
        },
        {
          category: 'Trang sức',
          products: [
            {
              id: 16,
              productName: 'Vòng tay',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 89000,
              status: 'hàng mới',
              discount: 0
            },
            {
              id: 17,
              productName: 'Dây chuyền',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 159000,
              status: 'bán chạy',
              discount: 5
            },
            {
              id: 18,
              productName: 'Bông tai',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 99000,
              status: 'hàng mới',
              discount: 0
            }
          ]
        },
        {
          category: 'Đồ ngủ',
          products: [
            {
              id: 19,
              productName: 'Đồ bộ nữ',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 159000,
              status: 'hàng mới',
              discount: 0
            },
            {
              id: 20,
              productName: 'Đồ ngủ nam',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 189000,
              status: 'mềm mại',
              discount: 10
            },
            {
              id: 21,
              productName: 'Bộ pijama',
              image_url: 'https://dongphuchaianh.vn/wp-content/uploads/2021/07/thoi-trang-nam-mua-he-1-1.jpg',
              price: 209000,
              status: 'hàng mới',
              discount: 15
            }
          ]
        }
      ]
    };


    return of(mockData);
  }
  getProductById(id: number): Observable<Product | undefined> {
    const allCategories = this.getProducts(); // Gọi lại mock data
    let foundProduct: Product | undefined;

    // Lưu ý: getProducts() trả về Observable nên ta cần xử lý bất đồng bộ
    // Nếu muốn trả về observable trực tiếp:
    return new Observable<Product | undefined>(observer => {
      this.getProducts().subscribe(response => {
        for (const category of response.data) {
          const product = category.products.find(p => p.id === id);
          if (product) {
            observer.next(product);
            observer.complete();
            return;
          }
        }
        observer.next(undefined); // Không tìm thấy
        observer.complete();
      });
    });
  }


}
