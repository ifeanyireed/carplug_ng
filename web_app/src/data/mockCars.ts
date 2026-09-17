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
    id: "v-toyota-camry-2020",
    name: "Toyota Camry XSE V6",
    year: 2020,
    make: "Toyota",
    model: "Camry",
    type: "Sedan",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 26500000,
    originalPrice: 28000000,
    badge: "Great Price",
    image: "/images/cars/car18.jpeg",
    mileage: "41,200 km",
    hasVideo: true,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
  {
    id: "v-mercedes-gle450-2022",
    name: "Mercedes-Benz GLE 450 4MATIC",
    year: 2022,
    make: "Mercedes-Benz",
    model: "GLE-Class",
    type: "SUV",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Hybrid",
    price: 68000000,
    originalPrice: 71000000,
    badge: "Good Deal",
    image: "/images/cars/car17.jpeg",
    mileage: "19,800 km",
    hasVideo: true,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
  {
    id: "v-lexus-rx350-2021",
    name: "Lexus RX 350 F-Sport AWD",
    year: 2021,
    make: "Lexus",
    model: "RX 350",
    type: "SUV",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 42000000,
    originalPrice: 45000000,
    badge: "Featured",
    image: "/images/cars/car16.jpeg",
    mileage: "28,500 km",
    hasVideo: false,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
  {
    id: "v-honda-accord-2019",
    name: "Honda Accord Touring 2.0T",
    year: 2019,
    make: "Honda",
    model: "Accord",
    type: "Sedan",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 19500000,
    originalPrice: 21000000,
    badge: "Good Deal",
    image: "/images/cars/car15.jpeg",
    mileage: "54,000 km",
    hasVideo: true,
    isCertified: true,
    hasWarranty: false,
    isTrustedDealer: true,
  },
  {
    id: "v-toyota-corolla-2018",
    name: "Toyota Corolla LE (First Body)",
    year: 2018,
    make: "Toyota",
    model: "Corolla",
    type: "Sedan",
    condition: "Used",
    transmission: "Automatic",
    fuelType: "Gasoline",
    price: 13500000,
    originalPrice: 14000000,
    badge: "Great Price",
    image: "/images/cars/car1.jpeg",
    mileage: "82,000 km",
    hasVideo: false,
    isCertified: true,
    hasWarranty: true,
    isTrustedDealer: true,
  },
];
