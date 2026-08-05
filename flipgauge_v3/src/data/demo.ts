export type Product = {
  asin: string;
  upc: string;
  title: string;
  category: string;
  image: string;
  buyBox: number;
  lowestFba: number;
  rank: number;
  monthlySales: number;
  sellers: number;
  amazonOnListing: boolean;
  eligible: boolean;
  hazmat: boolean;
  referralRate: number;
  fulfillmentFee: number;
  history: number[];
};

export const products: Product[] = [
  {
    asin: 'B0DEMO1234', upc: '012345678905', title: 'TrailForge Stainless Vacuum Bottle, 32 oz',
    category: 'Sports & Outdoors', image: '🥤', buyBox: 34.99, lowestFba: 33.87, rank: 8420,
    monthlySales: 214, sellers: 7, amazonOnListing: false, eligible: true, hazmat: false,
    referralRate: 0.15, fulfillmentFee: 5.12,
    history: [31.99,32.49,32.49,33.25,34.99,34.99,33.99,34.50,34.99,34.99,34.99,35.49,34.99,34.99]
  },
  {
    asin: 'B0HOME4421', upc: '036000291452', title: 'HomeNest Bamboo Drawer Organizer, Expandable',
    category: 'Home & Kitchen', image: '🗄️', buyBox: 28.49, lowestFba: 27.99, rank: 13220,
    monthlySales: 146, sellers: 5, amazonOnListing: false, eligible: true, hazmat: false,
    referralRate: 0.15, fulfillmentFee: 4.76,
    history: [26.99,27.49,27.49,27.99,28.49,28.49,28.49,27.99,28.49,28.49,28.49,28.99,28.49,28.49]
  },
  {
    asin: 'B0RISK9999', upc: '074000000001', title: 'GlowLab Professional Styling Spray, 12 oz',
    category: 'Beauty & Personal Care', image: '🧴', buyBox: 19.95, lowestFba: 18.49, rank: 56100,
    monthlySales: 38, sellers: 19, amazonOnListing: true, eligible: false, hazmat: true,
    referralRate: 0.15, fulfillmentFee: 4.22,
    history: [24.99,23.49,22.99,22.49,21.99,21.49,20.99,20.49,19.99,19.95,19.95,19.49,19.95,19.95]
  }
];
