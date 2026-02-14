import { useState } from 'react';
import { User, Home, Calendar, CheckCircle, ChevronRight, ChevronLeft, Image as ImageIcon, X, Camera, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';

interface AddTenantWizardProps {
    pgId: string;
    onComplete: () => void;
    onCancel: () => void;
}

const steps = [
    { id: 1, title: 'Identity', icon: User },
    { id: 2, title: 'Room', icon: Home },
    { id: 3, title: 'Photo', icon: Camera },
    { id: 4, title: 'Confirm', icon: CheckCircle },
];

const AddTenantWizard = ({ pgId, onComplete, onCancel }: AddTenantWizardProps) => {
    const { getFloorsForPG, getRoomsForFloor, getResidentsForRoom, addResident, uploadImage } = useApp();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        aadharNumber: '',
        occupation: '',
        gender: 'male' as 'male' | 'female' | 'other',
        floorId: '',
        roomId: '',
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'monthly' as 'monthly' | 'daily' | 'notice_period',
        profileImage: '',
    });

    const floors = getFloorsForPG(pgId);
    const rooms = formData.floorId ? getRoomsForFloor(formData.floorId) : [];

    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    const roomOccupancy = selectedRoom ? getResidentsForRoom(selectedRoom.id).length : 0;
    const isRoomFull = selectedRoom ? roomOccupancy >= selectedRoom.capacity : false;

    const canNext = () => {
        if (currentStep === 1) return formData.name && formData.phone && formData.email && formData.aadharNumber;
        if (currentStep === 2) return formData.floorId && formData.roomId;
        return true;
    };

    const handleNext = () => {
        if (!canNext()) return;
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await uploadImage(e.target.files[0]);
                setFormData(prev => ({ ...prev, profileImage: url }));
            } catch {
                // upload error is handled by context toast
            } finally {
                setIsUploading(false);
            }
        }
    };


    const handleSubmit = () => {
        const { profileImage, ...rest } = formData;
        addResident({
            ...rest,
            pgId,
            profileImage: profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        });
        onComplete();
    };

    const isValid = () => {
        if (currentStep === 1) {
            return formData.name && formData.phone && formData.occupation;
        }
        if (currentStep === 2) {
            return formData.roomId && !isRoomFull;
        }
        return true;
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-xl border border-border/50">
            {/* Steps Header */}
            <div className="bg-slate-50/50 border-b border-border/40 p-6">
                <div className="flex items-center justify-between max-w-md mx-auto relative">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isActive ? 'bg-accent text-accent-foreground ring-4 ring-accent/20 scale-110' :
                                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-accent' : 'text-muted-foreground/60'}`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] bg-border/50 -z-10">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: isCompleted ? '100%' : '0%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-md mx-auto"
                    >
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-display font-bold text-slate-800">Identity Details</h2>
                                    <p className="text-sm text-slate-500">Provide the basic identifying information for the new resident.</p>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5"><Label className="text-slate-600">Full Name</Label><Input className="bg-slate-50 border-slate-200" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><Label className="text-slate-600">Phone</Label><Input className="bg-slate-50 border-slate-200" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." /></div>
                                        <div className="space-y-1.5"><Label className="text-slate-600">Email</Label><Input className="bg-slate-50 border-slate-200" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5"><Label className="text-slate-600">Occupation</Label><Input className="bg-slate-50 border-slate-200" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} placeholder="Professional" /></div>
                                        <div className="space-y-1.5"><Label className="text-slate-600">Aadhar</Label><Input className="bg-slate-50 border-slate-200" value={formData.aadharNumber} onChange={e => setFormData({ ...formData, aadharNumber: e.target.value })} placeholder="12-digit number" /></div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600">Gender</Label>
                                        <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v as any })}>
                                            <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-display font-bold text-slate-800">Room Selection</h2>
                                    <p className="text-sm text-slate-500">Pick a floor and room that fits the resident's budget and sharing preference.</p>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600">Select Floor</Label>
                                        <Select value={formData.floorId} onValueChange={v => setFormData({ ...formData, floorId: v, roomId: '' })}>
                                            <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Choose a floor" /></SelectTrigger>
                                            <SelectContent>
                                                {floors.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {formData.floorId && (
                                        <div className="space-y-3">
                                            <Label className="text-slate-600">Available Rooms</Label>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {rooms.length === 0 ? <p className="text-sm text-slate-400 italic">No rooms on this floor.</p> :
                                                    rooms.map(r => {
                                                        const occ = getResidentsForRoom(r.id).length;
                                                        const full = occ >= r.capacity;
                                                        const selected = formData.roomId === r.id;
                                                        return (
                                                            <div
                                                                key={r.id}
                                                                className={`cursor-pointer border rounded-xl p-4 flex items-center justify-between transition-all ${selected ? 'border-accent bg-accent/5 ring-1 ring-accent' :
                                                                    full ? 'opacity-40 grayscale pointer-events-none' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                                onClick={() => !full && setFormData({ ...formData, roomId: r.id })}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${selected ? 'bg-accent/20 text-accent' : 'bg-slate-100 text-slate-500'}`}>
                                                                        <Home className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold block text-slate-700">Room {r.name}</span>
                                                                        <span className="text-xs text-slate-500">{r.sharingType} Sharing</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="block font-bold text-slate-900">₹{r.rent}</span>
                                                                    <span className={`text-[10px] font-bold ${occ === r.capacity ? 'text-rose-500' : 'text-emerald-500'}`}>{occ}/{r.capacity} Filled</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600">Joining Date</Label>
                                        <Input className="bg-slate-50 border-slate-200" type="date" value={formData.joinedDate} onChange={e => setFormData({ ...formData, joinedDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-4 text-center">
                                    <h2 className="text-xl font-display font-bold text-slate-800">Profile Photo</h2>
                                    <p className="text-sm text-slate-500">Add a photo of the resident for their digital identity.</p>
                                </div>

                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-accent">
                                            {formData.profileImage ? (
                                                <img src={formData.profileImage} alt="Resident" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-10 w-10 text-slate-300" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-accent/90 transition-all border-4 border-white">
                                            <Plus className="h-5 w-5" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                        </label>
                                        {formData.profileImage && (
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-800 transition-all"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-6 text-center max-w-[200px]">Optional. If not provided, a default avatar will be generated.</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-display font-bold text-slate-800">Confirm Onboarding</h2>
                                    <p className="text-sm text-slate-500">Review the onboarding summary before finalizing the resident's entry.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                                            <img
                                                src={formData.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'New Resident'}`}
                                                className="w-full h-full object-cover"
                                                alt="Resident"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-slate-900">{formData.name || 'Resident Name'}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{formData.occupation} · {formData.phone}</p>
                                            <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-slate-100">
                                                <Home className="h-3 w-3 text-accent" />
                                                <span className="text-[11px] font-bold text-slate-600">Room {selectedRoom?.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pb-2">
                                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600/70 block mb-0.5">Rent Due</span>
                                            <span className="font-bold text-emerald-700">₹{selectedRoom?.rent}/mo</span>
                                        </div>
                                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600/70 block mb-0.5">Joined on</span>
                                            <span className="font-bold text-blue-700">{formData.joinedDate}</span>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50 flex gap-3">
                                        <div className="mt-0.5"><CheckCircle className="h-4 w-4 text-amber-500" /></div>
                                        <p className="text-[11px] text-amber-800/80 leading-relaxed">By clicking complete, the resident will be added to the portal and their mobile log will be activated.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-border/40 px-8 py-6 flex items-center justify-between">
                <Button variant="ghost" className="hover:bg-slate-200/50 px-6 font-bold text-slate-500" onClick={currentStep === 1 ? onCancel : handleBack}>
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                <div className="flex gap-3">
                    <Button
                        className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-8 font-bold"
                        onClick={handleNext}
                        disabled={!isValid()}
                    >
                        {currentStep === 4 ? 'Complete Onboarding' : 'Next Step'} <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddTenantWizard;
