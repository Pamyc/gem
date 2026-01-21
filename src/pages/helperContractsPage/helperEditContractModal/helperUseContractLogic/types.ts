
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
  subcategory?: string; // Новое поле
}

export interface UseContractLogicProps {
  isOpen: boolean;
  nodeData?: any;
  onSuccess: () => void;
  onClose: () => void;
}
