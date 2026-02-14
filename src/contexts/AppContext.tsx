import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { PG, Floor, Room, Resident, Payment, Grievance, SeparationRequest } from '@/types';
import { mockPGs, mockFloors, mockRooms, mockResidents, mockPayments, mockGrievances, mockSeparationRequests } from '@/data/mockData';

let idCounter = 100;
const genId = (prefix: string) => `${prefix}${++idCounter}`;

interface AppContextType {
  pgs: PG[];
  floors: Floor[];
  rooms: Room[];
  residents: Resident[];
  payments: Payment[];
  grievances: Grievance[];
  separationRequests: SeparationRequest[];
  currentUser: { type: 'admin' | 'resident'; residentId?: string } | null;
  loginAsAdmin: (email: string, password: string) => boolean;
  loginAsResident: (residentId: string) => boolean;
  logout: () => void;
  addPG: (pg: Omit<PG, 'id'>) => void;
  deletePG: (id: string) => void;
  addFloor: (floor: Omit<Floor, 'id'>) => void;
  deleteFloor: (id: string) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  deleteRoom: (id: string) => void;
  addResident: (resident: Omit<Resident, 'id' | 'customId'>) => void;
  removeResident: (id: string) => void;
  bulkRemoveResidents: (ids: string[]) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  bulkAddPayment: (residentIds: string[], payment: Omit<Payment, 'id' | 'residentId'>) => void;
  reportGrievance: (grievance: Omit<Grievance, 'id' | 'reportedAt' | 'status'>) => void;
  updateGrievanceStatus: (id: string, status: Grievance['status']) => void;
  bulkUpdateGrievanceStatus: (ids: string[], status: Grievance['status']) => void;
  requestSeparation: (residentId: string, pgId: string, initiatedBy: 'resident' | 'admin') => void;
  approveSeparation: (id: string, exitDate: string) => void;
  rejectSeparation: (id: string) => void;
  withdrawSeparation: (id: string) => void;
  getResidentById: (id: string) => Resident | undefined;
  getPaymentsForResident: (residentId: string) => Payment[];
  getResidentsForPG: (pgId: string) => Resident[];
  getResidentsForRoom: (roomId: string) => Resident[];
  getFloorsForPG: (pgId: string) => Floor[];
  getRoomsForFloor: (floorId: string) => Room[];
  getPGById: (id: string) => PG | undefined;
  getFloorById: (id: string) => Floor | undefined;
  getRoomById: (id: string) => Room | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [pgs, setPgs] = useState<PG[]>(mockPGs);
  const [floors, setFloors] = useState<Floor[]>(mockFloors);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [grievances, setGrievances] = useState<Grievance[]>(mockGrievances);
  const [separationRequests, setSeparationRequests] = useState<SeparationRequest[]>(mockSeparationRequests);
  const [currentUser, setCurrentUser] = useState<{ type: 'admin' | 'resident'; residentId?: string } | null>(null);

  const loginAsAdmin = useCallback((email: string, password: string) => {
    if (email && password) { setCurrentUser({ type: 'admin' }); return true; }
    return false;
  }, []);

  const loginAsResident = useCallback((residentId: string) => {
    const r = residents.find(r => r.customId === residentId || r.id === residentId);
    if (r) { setCurrentUser({ type: 'resident', residentId: r.id }); return true; }
    return false;
  }, [residents]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const addPG = useCallback((pg: Omit<PG, 'id'>) => {
    setPgs(prev => [...prev, { ...pg, id: genId('pg') }]);
  }, []);

  const deletePG = useCallback((id: string) => {
    setPgs(prev => prev.filter(p => p.id !== id));
    setFloors(prev => prev.filter(f => f.pgId !== id));
    setRooms(prev => prev.filter(r => r.pgId !== id));
    setResidents(prev => prev.filter(r => r.pgId !== id));
  }, []);

  const addFloor = useCallback((floor: Omit<Floor, 'id'>) => {
    setFloors(prev => [...prev, { ...floor, id: genId('f') }]);
  }, []);

  const deleteFloor = useCallback((id: string) => {
    setFloors(prev => prev.filter(f => f.id !== id));
    setRooms(prev => prev.filter(r => r.floorId !== id));
    setResidents(prev => prev.filter(r => r.floorId !== id));
  }, []);

  const addRoom = useCallback((room: Omit<Room, 'id'>) => {
    setRooms(prev => [...prev, { ...room, id: genId('r') }]);
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    setResidents(prev => prev.filter(r => r.roomId !== id));
  }, []);

  const addResident = useCallback((resident: Omit<Resident, 'id' | 'customId'>) => {
    const id = genId('res');
    const customId = `HEL${String(idCounter).padStart(3, '0')}`;
    setResidents(prev => [...prev, { ...resident, id, customId }]);
  }, []);

  const removeResident = useCallback((id: string) => {
    setResidents(prev => prev.filter(r => r.id !== id));
    setPayments(prev => prev.filter(p => p.residentId !== id));
  }, []);

  const bulkRemoveResidents = useCallback((ids: string[]) => {
    setResidents(prev => prev.filter(r => !ids.includes(r.id)));
    setPayments(prev => prev.filter(p => !ids.includes(p.residentId)));
  }, []);

  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
    setPayments(prev => [...prev, { ...payment, id: genId('pay') }]);
  }, []);

  const bulkAddPayment = useCallback((residentIds: string[], payment: Omit<Payment, 'id' | 'residentId'>) => {
    const newPayments = residentIds.map(rid => ({ ...payment, residentId: rid, id: genId('pay') }));
    setPayments(prev => [...prev, ...newPayments]);
  }, []);

  const reportGrievance = useCallback((grievance: Omit<Grievance, 'id' | 'reportedAt' | 'status'>) => {
    setGrievances(prev => [...prev, {
      ...grievance, id: genId('g'), reportedAt: new Date().toISOString(), status: 'pending',
    }]);
  }, []);

  const updateGrievanceStatus = useCallback((id: string, status: Grievance['status']) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  }, []);

  const bulkUpdateGrievanceStatus = useCallback((ids: string[], status: Grievance['status']) => {
    setGrievances(prev => prev.map(g => ids.includes(g.id) ? { ...g, status } : g));
  }, []);

  const requestSeparation = useCallback((residentId: string, pgId: string, initiatedBy: 'resident' | 'admin') => {
    const r = residents.find(res => res.id === residentId);
    if (!r) return;
    const room = rooms.find(rm => rm.id === r.roomId);
    const floor = floors.find(f => f.id === r.floorId);
    const requestDate = new Date().toISOString().split('T')[0];
    const exit = new Date();
    exit.setMonth(exit.getMonth() + 1);
    const exitDate = exit.toISOString().split('T')[0];
    setSeparationRequests(prev => [...prev, {
      id: genId('sep'), residentId, residentName: r.name,
      requestDate, exitDate, status: 'pending',
      roomName: room?.name || '', floorName: floor?.name || '',
      pgId, initiatedBy,
    }]);
  }, [residents, rooms, floors]);

  const approveSeparation = useCallback((id: string, exitDate: string) => {
    setSeparationRequests(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' as const, exitDate } : s));
    const req = separationRequests.find(s => s.id === id);
    if (req) {
      setResidents(prev => prev.map(r => r.id === req.residentId ? { ...r, status: 'notice_period' as const, exitDate } : r));
    }
  }, [separationRequests]);

  const rejectSeparation = useCallback((id: string) => {
    setSeparationRequests(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s));
  }, []);

  const withdrawSeparation = useCallback((id: string) => {
    const req = separationRequests.find(s => s.id === id);
    setSeparationRequests(prev => prev.filter(s => s.id !== id));
    if (req) {
      setResidents(prev => prev.map(r => r.id === req.residentId ? { ...r, status: 'monthly' as const, exitDate: undefined } : r));
    }
  }, [separationRequests]);

  const getResidentById = useCallback((id: string) => residents.find(r => r.id === id), [residents]);
  const getPaymentsForResident = useCallback((residentId: string) => payments.filter(p => p.residentId === residentId), [payments]);
  const getResidentsForPG = useCallback((pgId: string) => residents.filter(r => r.pgId === pgId), [residents]);
  const getResidentsForRoom = useCallback((roomId: string) => residents.filter(r => r.roomId === roomId), [residents]);
  const getFloorsForPG = useCallback((pgId: string) => floors.filter(f => f.pgId === pgId), [floors]);
  const getRoomsForFloor = useCallback((floorId: string) => rooms.filter(r => r.floorId === floorId), [rooms]);
  const getPGById = useCallback((id: string) => pgs.find(p => p.id === id), [pgs]);
  const getFloorById = useCallback((id: string) => floors.find(f => f.id === id), [floors]);
  const getRoomById = useCallback((id: string) => rooms.find(r => r.id === id), [rooms]);

  return (
    <AppContext.Provider value={{
      pgs, floors, rooms, residents, payments, grievances, separationRequests, currentUser,
      loginAsAdmin, loginAsResident, logout,
      addPG, deletePG, addFloor, deleteFloor, addRoom, deleteRoom,
      addResident, removeResident, bulkRemoveResidents,
      addPayment, bulkAddPayment,
      reportGrievance, updateGrievanceStatus, bulkUpdateGrievanceStatus,
      requestSeparation, approveSeparation, rejectSeparation, withdrawSeparation,
      getResidentById, getPaymentsForResident, getResidentsForPG, getResidentsForRoom,
      getFloorsForPG, getRoomsForFloor, getPGById, getFloorById, getRoomById,
    }}>
      {children}
    </AppContext.Provider>
  );
};
