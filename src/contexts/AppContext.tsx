import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import {
  PG, Floor, Room, Resident, Payment, Grievance, SeparationRequest, User
} from '../types';
import { toast } from 'sonner';

// Dynamically determine the API URL based on current host (supports IPv4 access)
const API_URL = `http://${window.location.hostname}:3001/api`;

interface AppContextType {
  pgs: PG[];
  floors: Floor[];
  rooms: Room[];
  residents: Resident[];
  payments: Payment[];
  grievances: Grievance[];
  separationRequests: SeparationRequest[];
  currentUser: User | null;
  isLoading: boolean;
  loginAsAdmin: (email: string, password: string) => boolean;
  loginAsResident: (residentId: string) => boolean;
  logout: () => void;
  // CRUD
  addPG: (pg: Omit<PG, 'id'>) => Promise<void>;
  updatePG: (id: string, pg: Partial<PG>) => Promise<void>;
  deletePG: (id: string) => Promise<void>;
  addFloor: (floor: Omit<Floor, 'id'>) => Promise<void>;
  updateFloor: (id: string, floor: Partial<Floor>) => Promise<void>;
  deleteFloor: (id: string) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addResident: (resident: Omit<Resident, 'id' | 'customId'>) => Promise<void>;
  removeResident: (id: string) => Promise<void>;
  bulkRemoveResidents: (ids: string[]) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  bulkAddPayment: (residentIds: string[], payment: Omit<Payment, 'id' | 'residentId'>) => Promise<void>;
  reportGrievance: (grievance: Omit<Grievance, 'id' | 'reportedAt' | 'status'>) => Promise<void>;
  updateGrievanceStatus: (id: string, status: Grievance['status']) => Promise<void>;
  bulkUpdateGrievanceStatus: (ids: string[], status: Grievance['status']) => Promise<void>;
  requestSeparation: (residentId: string, pgId: string, initiatedBy: 'resident' | 'admin') => Promise<void>;
  approveSeparation: (id: string, exitDate: string) => Promise<void>;
  rejectSeparation: (id: string) => Promise<void>;
  withdrawSeparation: (id: string) => Promise<void>;
  // Getters & Utils
  getResidentById: (id: string) => Resident | undefined;
  getPaymentsForResident: (residentId: string) => Payment[];
  getResidentsForPG: (pgId: string) => Resident[];
  getResidentsForRoom: (roomId: string) => Resident[];
  getFloorsForPG: (pgId: string) => Floor[];
  getRoomsForFloor: (floorId: string) => Room[];
  getPGById: (id: string) => PG | undefined;
  getFloorById: (id: string) => Floor | undefined;
  getRoomById: (id: string) => Room | undefined;
  uploadImage: (file: File) => Promise<string>;
  uploadMultipleImages: (files: File[]) => Promise<string[]>;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [separationRequests, setSeparationRequests] = useState<SeparationRequest[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vasathi_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Map MongoDB _id to id
  const mapDoc = (doc: any) => ({ ...doc, id: doc._id });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/db`);
      if (response.ok) {
        const data = await response.json();
        setPgs((data.pgs || []).map(mapDoc));
        setFloors((data.floors || []).map(mapDoc));
        setRooms((data.rooms || []).map(mapDoc));
        setResidents((data.residents || []).map(mapDoc));
        setPayments((data.payments || []).map(mapDoc));
        setGrievances((data.grievances || []).map(mapDoc));
        setSeparationRequests((data.separationRequests || []).map(mapDoc));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vasathi_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vasathi_currentUser');
    }
  }, [currentUser]);

  // Generic Request Helper
  const apiRequest = async (path: string, method: string, body?: any) => {
    const res = await fetch(`${API_URL}/${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(`API ${method} ${path} failed`);
    return res.json();
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      return `http://${window.location.hostname}:3001${data.imageUrl}`;
    } catch (error) {
      toast.error('Image upload failed');
      throw error;
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    try {
      const response = await fetch(`${API_URL}/upload-multiple`, { method: 'POST', body: formData });
      const data = await response.json();
      return data.imageUrls.map((url: string) => `http://${window.location.hostname}:3001${url}`);
    } catch (error) {
      toast.error('Multiple image upload failed');
      throw error;
    }
  };

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

  // CRUD Implementations - Strictly await-ed for MongoDB sync
  const addPG = async (pg: Omit<PG, 'id'>) => {
    const newDoc = await apiRequest('pgs', 'POST', pg);
    setPgs(prev => [...prev, mapDoc(newDoc)]);
  };
  const updatePG = async (id: string, pg: Partial<PG>) => {
    const updated = await apiRequest(`pgs/${id}`, 'PUT', pg);
    setPgs(prev => prev.map(p => p.id === id ? mapDoc(updated) : p));
  };
  const deletePG = async (id: string) => {
    await apiRequest(`pgs/${id}`, 'DELETE');
    setPgs(prev => prev.filter(p => p.id !== id));
  };

  const addFloor = async (floor: Omit<Floor, 'id'>) => {
    const newDoc = await apiRequest('floors', 'POST', floor);
    setFloors(prev => [...prev, mapDoc(newDoc)]);
  };
  const updateFloor = async (id: string, floor: Partial<Floor>) => {
    const updated = await apiRequest(`floors/${id}`, 'PUT', floor);
    setFloors(prev => prev.map(f => f.id === id ? mapDoc(updated) : f));
  };
  const deleteFloor = async (id: string) => {
    await apiRequest(`floors/${id}`, 'DELETE');
    setFloors(prev => prev.filter(f => f.id !== id));
  };

  const addRoom = async (room: Omit<Room, 'id'>) => {
    const newDoc = await apiRequest('rooms', 'POST', room);
    setRooms(prev => [...prev, mapDoc(newDoc)]);
  };
  const updateRoom = async (id: string, room: Partial<Room>) => {
    const updated = await apiRequest(`rooms/${id}`, 'PUT', room);
    setRooms(prev => prev.map(r => r.id === id ? mapDoc(updated) : r));
  };
  const deleteRoom = async (id: string) => {
    await apiRequest(`rooms/${id}`, 'DELETE');
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const addResident = async (resident: Omit<Resident, 'id' | 'customId'>) => {
    const customId = `VAS${Date.now().toString().slice(-6)}`;
    const newDoc = await apiRequest('residents', 'POST', { ...resident, customId });
    setResidents(prev => [...prev, mapDoc(newDoc)]);
  };
  const removeResident = async (id: string) => {
    await apiRequest(`residents/${id}`, 'DELETE');
    setResidents(prev => prev.filter(r => r.id !== id));
  };
  const bulkRemoveResidents = async (ids: string[]) => {
    await Promise.all(ids.map(id => apiRequest(`residents/${id}`, 'DELETE')));
    setResidents(prev => prev.filter(r => !ids.includes(r.id)));
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    const newDoc = await apiRequest('payments', 'POST', payment);
    setPayments(prev => [...prev, mapDoc(newDoc)]);
  };
  const bulkAddPayment = async (residentIds: string[], payment: Omit<Payment, 'id' | 'residentId'>) => {
    await Promise.all(residentIds.map(rid => apiRequest('payments', 'POST', { ...payment, residentId: rid })));
    await fetchData();
  };

  const reportGrievance = async (grievance: Omit<Grievance, 'id' | 'reportedAt' | 'status'>) => {
    const newDoc = await apiRequest('grievances', 'POST', {
      ...grievance, reportedAt: new Date().toISOString(), status: 'pending'
    });
    setGrievances(prev => [...prev, mapDoc(newDoc)]);
  };
  const updateGrievanceStatus = async (id: string, status: Grievance['status']) => {
    const updated = await apiRequest(`grievances/${id}`, 'PUT', { status });
    setGrievances(prev => prev.map(g => g.id === id ? mapDoc(updated) : g));
  };
  const bulkUpdateGrievanceStatus = async (ids: string[], status: Grievance['status']) => {
    await Promise.all(ids.map(id => apiRequest(`grievances/${id}`, 'PUT', { status })));
    await fetchData();
  };

  const requestSeparation = async (residentId: string, pgId: string, initiatedBy: 'resident' | 'admin') => {
    const r = residents.find(res => res.id === residentId);
    if (!r) return;
    const room = rooms.find(rm => rm.id === r.roomId);
    const floor = floors.find(f => f.id === r.floorId);
    const requestDate = new Date().toISOString().split('T')[0];
    const exit = new Date();
    exit.setMonth(exit.getMonth() + 1);
    const exitDate = exit.toISOString().split('T')[0];

    const newDoc = await apiRequest('separations', 'POST', {
      residentId, residentName: r.name, requestDate, exitDate, status: 'pending',
      roomName: room?.name || '', floorName: floor?.name || '', pgId, initiatedBy
    });
    setSeparationRequests(prev => [...prev, mapDoc(newDoc)]);
  };

  const approveSeparation = async (id: string, exitDate: string) => {
    const updated = await apiRequest(`separations/${id}`, 'PUT', { status: 'approved', exitDate });
    setSeparationRequests(prev => prev.map(s => s.id === id ? mapDoc(updated) : s));
    const req = updated;
    if (req) {
      const updatedRes = await apiRequest(`residents/${req.residentId}`, 'PUT', { status: 'notice_period', exitDate });
      setResidents(prev => prev.map(r => r.id === req.residentId ? mapDoc(updatedRes) : r));
    }
  };

  const rejectSeparation = async (id: string) => {
    const updated = await apiRequest(`separations/${id}`, 'PUT', { status: 'rejected' });
    setSeparationRequests(prev => prev.map(s => s.id === id ? mapDoc(updated) : s));
  };

  const withdrawSeparation = async (id: string) => {
    const req = separationRequests.find(s => s.id === id);
    await apiRequest(`separations/${id}`, 'DELETE');
    setSeparationRequests(prev => prev.filter(s => s.id !== id));
    if (req) {
      const updatedRes = await apiRequest(`residents/${req.residentId}`, 'PUT', { status: 'monthly', exitDate: null });
      setResidents(prev => prev.map(r => r.id === req.residentId ? mapDoc(updatedRes) : r));
    }
  };

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
      pgs, floors, rooms, residents, payments, grievances, separationRequests, currentUser, isLoading,
      loginAsAdmin, loginAsResident, logout,
      addPG, updatePG, deletePG, addFloor, updateFloor, deleteFloor, addRoom, updateRoom, deleteRoom,
      addResident, removeResident, bulkRemoveResidents,
      addPayment, bulkAddPayment,
      reportGrievance, updateGrievanceStatus, bulkUpdateGrievanceStatus,
      requestSeparation, approveSeparation, rejectSeparation, withdrawSeparation,
      getResidentById, getPaymentsForResident, getResidentsForPG, getResidentsForRoom,
      getFloorsForPG, getRoomsForFloor, getPGById, getFloorById, getRoomById,
      uploadImage, uploadMultipleImages, fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};
