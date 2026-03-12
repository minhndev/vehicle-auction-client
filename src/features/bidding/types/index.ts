export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: string; // e.g., 'SUV', 'Sedan', 'Truck', 'Electric', 'Luxury'
  image: string;
  mileage: number;
  fuelType: string;
  transmission: string;
}

export interface Auction {
  id: string;
  vehicle: Vehicle;
  startingPrice: number;
  currentBid: number;
  totalBids: number;
  endTime: string; // ISO date string
  status: 'upcoming' | 'active' | 'ended';
  sellerId: string;
}
