export interface PG {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  contact: string;
  image?: string;
  photos: string[];
}

export interface Floor {
  id: string;
  pgId: string;
  name: string;
  slug: string;
  photos?: string[];
}

export interface Room {
  id: string;
  floorId: string;
  pgId: string;
  name: string;
  sharingType: string;
  acType: 'ac' | 'non_ac';
  capacity: number;
  rent: number;
  photos?: string[];
}

export interface Resident {
  id: string;
  customId: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  aadharNumber: string;
  gender: 'male' | 'female' | 'other';
  joinedDate: string;
  status: 'daily' | 'monthly' | 'notice_period';
  roomId: string;
  floorId: string;
  pgId: string;
  profileImage: string;
  exitDate?: string;
}

export interface Payment {
  id: string;
  residentId: string;
  period: string;
  type: 'rent' | 'advance' | 'deposit' | 'other';
  status: 'paid' | 'partially_paid' | 'unpaid';
  amount: number;
  date: string;
}

export interface Grievance {
  id: string;
  residentId: string;
  residentName: string;
  description: string;
  photos: string[];
  roomName: string;
  floorName: string;
  pgId: string;
  status: 'pending' | 'on_hold' | 'in_progress' | 'closed';
  reportedAt: string;
}

export interface SeparationRequest {
  id: string;
  residentId: string;
  residentName: string;
  requestDate: string;
  exitDate: string;
  status: 'pending' | 'approved' | 'rejected';
  roomName: string;
  floorName: string;
  pgId: string;
  initiatedBy: 'resident' | 'admin';
}

export interface User {
  type: 'admin' | 'resident';
  residentId?: string;
}
