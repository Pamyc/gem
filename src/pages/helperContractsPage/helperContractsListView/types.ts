
export interface LiterNode {
  id: number;
  name: string;
  elevators: number;
  floors: number;
  fullData: any; // Raw row data for modal
  isAggregate: boolean;
  contractId: number;
  children?: LiterNode[];
}

export interface JKNode {
  name: string;
  totalElevators: number;
  totalFloors: number;
  totalContracts: number;
  totalLiters: number;
  liters: LiterNode[];
}

export interface CityNode {
  name: string;
  totalElevators: number;
  totalFloors: number;
  totalContracts: number;
  totalLiters: number;
  jks: JKNode[];
}
