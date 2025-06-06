export interface Size {
  size: string;
  stock: number;
  productSizeId: number;
}
export interface User{
  id : number;
  firstName : string;
  lastName:string;
  birthday :Date;
  address:string;
  email : string;
  phoneNumber : string;

}
export interface Category {
  id: number;
  parentId: number | null;
  categoryName: string;
  slug: string;
}

export interface SizeAdmin{
  id : number;
  size:string;
}
export interface StockDetail {
  color: string;
  img: string;
  sizes: Size[];
}
export interface Color{
  id : number;
  color : string;

}

export interface Product {
  id: number;
  productName: string;
  price: number;
  slug: string;
  discount: number;
  status: string;
  img: string;
  stockDetails: StockDetail[];
  isFavorite: boolean;
}

export interface ProductDetailResponse {
  code: number;
  message: string;
  data: {
    productDetails: Product;
    relatedProducts: Product[];
  };
}

export interface ProductCategory {
  category: string;
  products: Product[];
}

export interface ProductResponse {
  code: number;
  message: string;
  data: { [key: string]: Product[] };
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  message: string;
}

// Color mapping utility
export const colorMap: { [key: string]: string } = {
  'Đen': '#000000',
  'Trắng': '#FFFFFF',
  'Xanh': '#0000FF',
  'Đỏ': '#FF0000',
  'Vàng': '#FFFF00',
  'Xanh lá': '#00FF00',
  'Hồng': '#FFC0CB',
  'Tím': '#800080',
  'Cam': '#FFA500',
  'Nâu': '#A52A2A',
  'Xám': '#808080',
  'Be': '#F5F5DC',
  'Kem': '#FFFDD0',
  'Xanh dương': '#0000FF',
  'Xanh navy': '#000080',
  'Xanh rêu': '#556B2F',
  'Xanh mint': '#98FF98',
  'Xanh pastel': '#B0E0E6',
  'Hồng pastel': '#FFB6C1',
  'Vàng pastel': '#FFFACD',
  'Tím pastel': '#E6E6FA',
  'Cam pastel': '#FFDAB9',
  'Nâu pastel': '#DEB887',
  'Xám pastel': '#D3D3D3',
  'Be pastel': '#F5F5DC',
  'Kem pastel': '#FFFDD0',
  'Ghi': '#848188'
};

export function getColorValue(colorName: string): string {
  return colorMap[colorName] || '#CCCCCC';
}
