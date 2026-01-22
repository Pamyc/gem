
export interface LiterItem {
  id?: number;
  name: string;
  elevators: number;
  floors: number;
}

export interface Transaction {
  id?: number;
  date: string;
  value: number;
  text: string;
  subcategory?: string; 
  createdBy?: string; // New field for audit
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseContractLogicProps {
  isOpen: boolean;
  nodeData?: any;
  onSuccess: () => void;
  onClose: () => void;
  user?: any; // Pass user object
}
