export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: string;
  date: string;
}

export const ORDERS_DATA: Order[] = [
  { id: 'ORD-2024-001', customer: 'Ramesh Kumar', email: 'r.kumar@iitm.ac.in', product: 'Potentiostat EW-1000', amount: 285000, status: 'delivered', date: '2024-11-10' },
  { id: 'ORD-2024-002', customer: 'Priya Shankar', email: 'priya@vit.ac.in', product: 'Multi-Channel EW-4CH', amount: 580000, status: 'processing', date: '2024-11-18' },
  { id: 'ORD-2024-003', customer: 'Anil Verma', email: 'anil@bpcl.co.in', product: 'PLC-200', amount: 45000, status: 'shipped', date: '2024-11-20' },
  { id: 'ORD-2024-004', customer: 'Dr. Shalini Rao', email: 'shalini@nitt.edu', product: 'Fuel Cell FC-500', amount: 420000, status: 'pending', date: '2024-11-22' },
  { id: 'ORD-2024-005', customer: 'TechCorp Chennai', email: 'purchase@techcorp.in', product: 'Battery BA-8CH', amount: 185000, status: 'delivered', date: '2024-11-05' },
];
