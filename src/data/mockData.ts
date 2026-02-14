import { PG, Floor, Room, Resident, Payment, Grievance, SeparationRequest } from '@/types';

export const mockPGs: PG[] = [
  {
    id: 'pg1',
    name: 'Helios Residency',
    slug: 'helios',
    description: 'Premium co-living space in the heart of the city with modern amenities, 24/7 security, and a vibrant community.',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    contact: '+91 9876543210',
    image: '',
  },
];

export const mockFloors: Floor[] = [
  { id: 'f1', pgId: 'pg1', name: 'First Floor', slug: 'first-floor' },
  { id: 'f2', pgId: 'pg1', name: 'Second Floor', slug: 'second-floor' },
];

export const mockRooms: Room[] = [
  { id: 'r1', floorId: 'f1', pgId: 'pg1', name: '101', sharingType: 'Double', acType: 'ac', capacity: 2, rent: 8000 },
  { id: 'r2', floorId: 'f1', pgId: 'pg1', name: '102', sharingType: 'Single', acType: 'non_ac', capacity: 1, rent: 12000 },
  { id: 'r3', floorId: 'f2', pgId: 'pg1', name: '201', sharingType: 'Triple', acType: 'ac', capacity: 3, rent: 6000 },
  { id: 'r4', floorId: 'f2', pgId: 'pg1', name: '202', sharingType: 'Double', acType: 'ac', capacity: 2, rent: 9000 },
];

export const mockResidents: Resident[] = [
  {
    id: 'res1', customId: 'HEL001', name: 'Rahul Sharma', email: 'rahul@example.com',
    phone: '+91 9876543201', occupation: 'Software Engineer', aadharNumber: '1234-5678-9012',
    gender: 'male', joinedDate: '2024-06-15', status: 'monthly',
    roomId: 'r1', floorId: 'f1', pgId: 'pg1', profileImage: '',
  },
  {
    id: 'res2', customId: 'HEL002', name: 'Priya Patel', email: 'priya@example.com',
    phone: '+91 9876543202', occupation: 'UI/UX Designer', aadharNumber: '2345-6789-0123',
    gender: 'female', joinedDate: '2024-08-01', status: 'monthly',
    roomId: 'r1', floorId: 'f1', pgId: 'pg1', profileImage: '',
  },
  {
    id: 'res3', customId: 'HEL003', name: 'Amit Kumar', email: 'amit@example.com',
    phone: '+91 9876543203', occupation: 'Student', aadharNumber: '3456-7890-1234',
    gender: 'male', joinedDate: '2025-01-10', status: 'daily',
    roomId: 'r2', floorId: 'f1', pgId: 'pg1', profileImage: '',
  },
  {
    id: 'res4', customId: 'HEL004', name: 'Sneha Reddy', email: 'sneha@example.com',
    phone: '+91 9876543204', occupation: 'Marketing Executive', aadharNumber: '4567-8901-2345',
    gender: 'female', joinedDate: '2024-11-20', status: 'notice_period',
    roomId: 'r3', floorId: 'f2', pgId: 'pg1', profileImage: '', exitDate: '2025-03-20',
  },
  {
    id: 'res5', customId: 'HEL005', name: 'Vikram Singh', email: 'vikram@example.com',
    phone: '+91 9876543205', occupation: 'Data Analyst', aadharNumber: '5678-9012-3456',
    gender: 'male', joinedDate: '2024-09-05', status: 'monthly',
    roomId: 'r3', floorId: 'f2', pgId: 'pg1', profileImage: '',
  },
];

export const mockPayments: Payment[] = [
  { id: 'pay1', residentId: 'res1', period: 'Mar 2025', type: 'rent', status: 'paid', amount: 8000, date: '2025-03-01' },
  { id: 'pay2', residentId: 'res1', period: 'Feb 2025', type: 'rent', status: 'paid', amount: 8000, date: '2025-02-01' },
  { id: 'pay3', residentId: 'res1', period: 'Jan 2025', type: 'advance', status: 'partially_paid', amount: 4000, date: '2025-01-01' },
  { id: 'pay4', residentId: 'res2', period: 'Mar 2025', type: 'rent', status: 'unpaid', amount: 8000, date: '2025-03-01' },
  { id: 'pay5', residentId: 'res2', period: 'Feb 2025', type: 'rent', status: 'paid', amount: 8000, date: '2025-02-01' },
  { id: 'pay6', residentId: 'res3', period: 'Feb 2025', type: 'deposit', status: 'paid', amount: 12000, date: '2025-02-01' },
  { id: 'pay7', residentId: 'res4', period: 'Mar 2025', type: 'rent', status: 'paid', amount: 6000, date: '2025-03-01' },
  { id: 'pay8', residentId: 'res5', period: 'Mar 2025', type: 'rent', status: 'unpaid', amount: 6000, date: '2025-03-01' },
];

export const mockGrievances: Grievance[] = [
  {
    id: 'g1', residentId: 'res1', residentName: 'Rahul Sharma',
    description: 'Water leakage in bathroom ceiling. Getting worse during rain. Needs immediate attention.',
    photos: [], roomName: '101', floorName: 'First Floor', pgId: 'pg1',
    status: 'in_progress', reportedAt: '2025-02-10T10:30:00',
  },
  {
    id: 'g2', residentId: 'res2', residentName: 'Priya Patel',
    description: 'WiFi connectivity issues in room. Very slow speeds during evening hours.',
    photos: [], roomName: '101', floorName: 'First Floor', pgId: 'pg1',
    status: 'pending', reportedAt: '2025-02-12T14:15:00',
  },
];

export const mockSeparationRequests: SeparationRequest[] = [
  {
    id: 'sep1', residentId: 'res4', residentName: 'Sneha Reddy',
    requestDate: '2025-02-20', exitDate: '2025-03-20',
    status: 'approved', roomName: '201', floorName: 'Second Floor',
    pgId: 'pg1', initiatedBy: 'resident',
  },
];
