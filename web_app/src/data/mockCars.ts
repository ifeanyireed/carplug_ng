export interface CarListing {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  type: string;
  condition: "New" | "Used";
  transmission: "Automatic" | "Manual";
  fuelType: "Gasoline" | "Electric" | "Hybrid" | "Diesel";
  price: number;
  originalPrice?: number;
  badge?: "Great Price" | "Good Deal" | "Featured";
  image: string;
  mileage?: string;
  hasVideo?: boolean;
  isCertified?: boolean;
  hasWarranty?: boolean;
  isTrustedDealer?: boolean;
}

export const CAR_LISTINGS: CarListing[] = [
  {
    id: "bmw-520d-2014",
    name: "BMW 520d",
    year: 2014,
    make: "BMW",
    model: "5 Series",
    type: "Sedan",
    condition: "New",
    transmission: "Manual",
    fuelType: "Electric",
    price: 49000,
    originalPrice: 59000,
    badge: "Great Price",
    image: "/images/cars/car18.jpeg",
    mileage: "12,400 mi",
    hasVideo: true,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
  {
    id: "audi-a4-2015",
    name: "Audi A4",
    year: 2015,
    make: "Audi",
    model: "A4",
    type: "Coupe",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 45000,
    originalPrice: 49000,
    badge: "Good Deal",
    image: "/images/cars/car16.jpeg",
    mileage: "34,100 mi",
    hasVideo: true,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
  {
    id: "merc-cclass-2016",
    name: "Mercedes-Benz C-Class",
    year: 2016,
    make: "Mercedes Benz",
    model: "C-Class",
    type: "Sedan",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 76000,
    image: "/images/cars/car17.jpeg",
    mileage: "21,000 mi",
    hasVideo: false,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
  {
    id: "lexus-is250-2013",
    name: "Lexus IS 250",
    year: 2013,
    make: "Lexus",
    model: "IS 250",
    type: "SUV",
    condition: "New",
    transmission: "Automatic",
    fuelType: "Hybrid",
    price: 52000,
    image: "/images/cars/car15.jpeg",
    mileage: "8,900 mi",
    hasVideo: true,
    isCertified: true,
    hasWarranty: false,
    isTrustedDealer: true,
  },
  {
    id: "volvo-s60-2017",
    name: "Volvo S60",
    year: 2017,
    make: "Volvo",
    model: "S60",
    type: "SUV",
    condition: "New",
    transmission: "Automatic",
    fuelType: "Electric",
    price: 54000,
    image: "/images/cars/car14.jpeg",
    mileage: "15,200 mi",
    hasVideo: false,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: false,
  },
  {
    id: "toyota-camry-2018",
    name: "Toyota Camry",
    year: 2018,
    make: "Toyota",
    model: "Camry",
    type: "SUV",
    condition: "New",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 36000,
    image: "/images/cars/car13.jpeg",
    mileage: "19,800 mi",
    hasVideo: true,
    isCertified: false,
    hasWarranty: true,
    isTrustedDealer: true,
  },
];
