'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Edit3,
  Bookmark,
  History,
  Bell,
  Sparkles,
  Lock,
  FileText,
  LogOut,
  Zap,
  ExternalLink,
  Trash2,
  Sliders,
  CheckCircle,
  CarFront,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Toast, ToastType } from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';

import {
  INITIAL_USER_PROFILE,
  INITIAL_PREFERENCES,
  INITIAL_SAVED_PARKING,
  INITIAL_RECENT_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  RADIUS_OPTIONS,
  ZONE_OPTIONS,
  UserProfile,
  ParkingPreferences,
  SavedParkingFacility,
  BookingSummary,
  NotificationPreferences,
} from '../../lib/profileData';

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  // State management
  const [profile, setProfile] = React.useState<UserProfile>(INITIAL_USER_PROFILE);
  const [preferences, setPreferences] = React.useState<ParkingPreferences>(INITIAL_PREFERENCES);
  const [savedFacilities, setSavedFacilities] = React.useState<SavedParkingFacility[]>(INITIAL_SAVED_PARKING);
  const [recentBookings, setRecentBookings] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationPreferences>(INITIAL_NOTIFICATIONS);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = React.useState<number>(0);

  // Vehicles states
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = React.useState(true);
  const [loadingBookings, setLoadingBookings] = React.useState(true);

  // New vehicle modal states
  const [isAddVehicleOpen, setIsAddVehicleOpen] = React.useState(false);
  const [isEditVehicleOpen, setIsEditVehicleOpen] = React.useState(false);
  const [isDeleteVehicleOpen, setIsDeleteVehicleOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<any | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<any | null>(null);

  // Vehicle form state
  const [vehForm, setVehForm] = React.useState({
    make: '',
    model: '',
    licensePlate: '',
    color: '',
    isEV: false,
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoadingVehicles(true);
      setLoadingBookings(true);

      // Load vehicles
      const vRes = await api.get('/api/vehicles');
      if (vRes.success && Array.isArray(vRes.data)) {
        setVehicles(vRes.data);
      }

      // Load bookings
      const bRes = await api.get('/api/bookings');
      if (bRes.success && Array.isArray(bRes.data)) {
        const mapped = bRes.data.slice(0, 3).map((b: any) => {
          const date = new Date(b.createdAt);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const entryTimeStr = b.entryTime ? new Date(b.entryTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const exitTimeStr = b.exitTime ? new Date(b.exitTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const priceStr = b.finalAmount !== null && b.finalAmount !== undefined ? `$${Number(b.finalAmount).toFixed(2)}` : '$5.00';
          
          return {
            id: b.id,
            facilityName: b.facility?.name || 'SmartPark Facility',
            status: b.status,
            date: dateStr,
            time: `${entryTimeStr} - ${exitTimeStr}`,
            slot: b.slot?.slotNumber || 'N/A',
            amount: priceStr
          };
        });
        setRecentBookings(mapped);
      }

      // Load notifications count
      const nRes = await api.get('/api/notifications?unread=true');
      if (nRes.success && Array.isArray(nRes.data)) {
        setUnreadNotificationsCount(nRes.data.length);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoadingVehicles(false);
      setLoadingBookings(false);
    }
  }, []);

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehForm.licensePlate.trim() || !vehForm.make.trim() || !vehForm.model.trim()) {
      showToast('Make, model, and license plate are required.', 'error');
      return;
    }

    try {
      const res = await api.post('/api/vehicles', {
        licensePlate: vehForm.licensePlate.toUpperCase().trim(),
        make: vehForm.make.trim(),
        model: vehForm.model.trim(),
        color: vehForm.color.trim() || null,
        isEV: vehForm.isEV,
      });

      if (res.success) {
        showToast('Vehicle registered successfully.', 'success');
        setIsAddVehicleOpen(false);
        setVehForm({ make: '', model: '', licensePlate: '', color: '', isEV: false });
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to register vehicle.', 'error');
    }
  };

  const handleEditVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (!vehForm.licensePlate.trim() || !vehForm.make.trim() || !vehForm.model.trim()) {
      showToast('Make, model, and license plate are required.', 'error');
      return;
    }

    try {
      const res = await api.put(`/api/vehicles/${selectedVehicle.id}`, {
        licensePlate: vehForm.licensePlate.toUpperCase().trim(),
        make: vehForm.make.trim(),
        model: vehForm.model.trim(),
        color: vehForm.color.trim() || null,
        isEV: vehForm.isEV,
      });

      if (res.success) {
        showToast('Vehicle updated successfully.', 'success');
        setIsEditVehicleOpen(false);
        setSelectedVehicle(null);
        setVehForm({ make: '', model: '', licensePlate: '', color: '', isEV: false });
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update vehicle.', 'error');
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      const res = await api.delete(`/api/vehicles/${vehicleToDelete.id}`);
      if (res.success) {
        showToast('Vehicle deleted successfully.', 'success');
        setIsDeleteVehicleOpen(false);
        setVehicleToDelete(null);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete vehicle.', 'error');
    }
  };

  React.useEffect(() => {
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      const user = authService.getCurrentUser();
      if (user) {
        setProfile((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
        }));
      }
      loadData();
    }
  }, [router, loadData]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  // Toast state
  const [toast, setToast] = React.useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  // Edit Profile Form State & Validation
  const [editForm, setEditForm] = React.useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  });

  const [editErrors, setEditErrors] = React.useState<{ [key: string]: string }>({});

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!editForm.name.trim()) errors.name = 'Name is required';
    if (!editForm.email.trim() || !editForm.email.includes('@')) errors.email = 'Valid email is required';
    if (!editForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!editForm.location.trim()) errors.location = 'Preferred location is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      location: editForm.location,
    }));

    setEditErrors({});
    setIsEditModalOpen(false);
    showToast('Account details updated successfully.');
  };

  // Saved parking removal handler
  const handleRemoveSavedFacility = (id: string, name: string) => {
    setSavedFacilities((prev) => prev.filter((item) => item.id !== id));
    showToast(`Removed "${name}" from saved parking.`);
  };

  // Preference change handler
  const handlePreferenceToggle = (key: keyof ParkingPreferences) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`Updated parking preferences.`);
      return updated;
    });
  };

  const handlePreferenceSelect = (key: keyof ParkingPreferences, value: string) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      showToast(`Saved preferred ${key === 'parkingRadius' ? 'radius' : 'zone'}.`);
      return updated;
    });
  };

  // Notification toggle handler
  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`Notification preferences updated.`);
      return updated;
    });
  };

  // Get initials for avatar
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-smartBg flex items-center justify-center font-mono text-xs text-smartTextSecondary">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-16 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 pt-4">
        {/* -------------------------------------------------- */}
        {/* 1. PAGE HEADER */}
        {/* -------------------------------------------------- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-smartBorder/60 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                Profile
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-signature/10 border border-signature/30 text-signature">
                v2.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-smartTextSecondary">
              Manage your SmartPark account and parking preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-smartSurface border border-smartBorder px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-available animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-smartTextPrimary">
                Account Active
              </span>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: HERO & ACCOUNT INFO & ACTIONS */}
          <div className="space-y-6 lg:col-span-1">
            {/* -------------------------------------------------- */}
            {/* 2. PROFILE HERO / ACCOUNT CARD */}
            {/* -------------------------------------------------- */}
            <Card variant="elevated" padding="lg" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Shield className="h-24 w-24 text-signature" />
              </div>

              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-signature/20 via-smartSurface to-smartElevated border-2 border-signature/50 flex items-center justify-center text-xl font-bold font-display text-signature shadow-lg">
                    {initials || 'P'}
                  </div>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-available ring-2 ring-smartElevated" aria-label="Status active" />
                </div>

                {/* User Details */}
                <h2 className="text-lg font-bold font-display text-smartTextPrimary mb-0.5">
                  {profile.name}
                </h2>
                <p className="text-xs text-smartTextSecondary font-mono mb-3">
                  {profile.email}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="signature">{profile.badge}</Badge>
                  <Badge variant="available">{profile.status}</Badge>
                </div>

                <div className="w-full pt-4 border-t border-smartBorder/50 flex items-center justify-between text-xs text-smartTextSecondary font-sans">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-signature" />
                    Member since
                  </span>
                  <span className="font-mono text-smartTextPrimary">{profile.memberSince}</span>
                </div>
              </div>
            </Card>

            {/* -------------------------------------------------- */}
            {/* 3. ACCOUNT INFORMATION */}
            {/* -------------------------------------------------- */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                  <User className="h-4 w-4 text-signature" />
                  Account Information
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditForm({
                      name: profile.name,
                      email: profile.email,
                      phone: profile.phone,
                      location: profile.location,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="h-7 text-[11px]"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-smartTextSecondary font-mono text-[10px] uppercase block mb-0.5">
                    Full Name
                  </span>
                  <span className="font-medium text-smartTextPrimary">{profile.name}</span>
                </div>

                <div>
                  <span className="text-smartTextSecondary font-mono text-[10px] uppercase block mb-0.5">
                    Email Address
                  </span>
                  <span className="font-medium text-smartTextPrimary font-mono">{profile.email}</span>
                </div>

                <div>
                  <span className="text-smartTextSecondary font-mono text-[10px] uppercase block mb-0.5">
                    Phone Number
                  </span>
                  <span className="font-medium text-smartTextPrimary font-mono">{profile.phone}</span>
                </div>

                <div>
                  <span className="text-smartTextSecondary font-mono text-[10px] uppercase block mb-0.5">
                    Preferred Location / Area
                  </span>
                  <span className="font-medium text-smartTextPrimary flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-signature shrink-0" />
                    {profile.location}
                  </span>
                </div>
              </div>
            </Card>

            {/* -------------------------------------------------- */}
            {/* 8. ACCOUNT ACTIONS */}
            {/* -------------------------------------------------- */}
            <Card variant="default" padding="lg" className="space-y-4">
              <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/50 pb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-signature" />
                Account Security & Actions
              </h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder hover:bg-smartElevated transition-all text-xs font-sans text-smartTextPrimary group"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-smartTextSecondary group-hover:text-signature transition-colors" />
                    Change Password
                  </span>
                  <span className="text-[10px] font-mono text-smartTextSecondary">Backend Pending</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder hover:bg-smartElevated transition-all text-xs font-sans text-smartTextPrimary group"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-smartTextSecondary group-hover:text-signature transition-colors" />
                    Privacy & Data Governance
                  </span>
                  <ExternalLink className="h-3 w-3 text-smartTextSecondary" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder hover:bg-smartElevated transition-all text-xs font-sans text-smartTextPrimary group"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-smartTextSecondary group-hover:text-signature transition-colors" />
                    Terms of Service
                  </span>
                  <ExternalLink className="h-3 w-3 text-smartTextSecondary" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-smart bg-occupied/10 border border-occupied/30 hover:bg-occupied/20 transition-all text-xs font-sans text-occupied font-medium group mt-2"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5 text-occupied" />
                    Sign Out / Log Out
                  </span>
                  <span className="text-[10px] font-mono text-occupied/80">Active Session</span>
                </button>
              </div>
            </Card>

            {/* QUICK LINK DIRECTORIES */}
            <Card variant="default" padding="lg" className="space-y-4">
              <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/50 pb-3 flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-signature" />
                Quick Navigation
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <Link href="/bookings">
                  <div className="w-full flex items-center justify-between p-2.5 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder hover:bg-smartElevated transition-all text-xs text-smartTextPrimary font-medium cursor-pointer">
                    <span>My Bookings</span>
                    <span className="text-[10px] text-signature">&rarr;</span>
                  </div>
                </Link>
                <Link href="/notifications">
                  <div className="w-full flex items-center justify-between p-2.5 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder hover:bg-smartElevated transition-all text-xs text-smartTextPrimary font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>Notifications Center</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-occupied text-white rounded-full leading-none">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-signature">&rarr;</span>
                  </div>
                </Link>
                <Link href="/support">
                  <div className="w-full flex items-center justify-between p-2.5 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder hover:bg-smartElevated transition-all text-xs text-smartTextPrimary font-medium cursor-pointer">
                    <span>Support & Help Desk</span>
                    <span className="text-[10px] text-signature">&rarr;</span>
                  </div>
                </Link>
              </div>
            </Card>

            {/* VEHICLES REGISTRY CARD */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                  <CarFront className="h-4 w-4 text-signature" />
                  Vehicles Registry
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVehForm({ make: '', model: '', licensePlate: '', color: '', isEV: false });
                    setIsAddVehicleOpen(true);
                  }}
                  className="h-7 text-xs text-signature"
                >
                  + Add
                </Button>
              </div>

              {loadingVehicles ? (
                <div className="space-y-2">
                  <LoadingSkeleton variant="rect" height="50px" className="w-full" />
                  <LoadingSkeleton variant="rect" height="50px" className="w-full" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="py-4 border border-dashed border-smartBorder/60 rounded-smart text-center text-xs text-smartTextSecondary">
                  No vehicles registered yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-smart bg-smartSurface/60 border border-smartBorder/60 flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-smartTextPrimary">
                            {v.make} {v.model}
                          </span>
                          {v.isEV && <Badge variant="ai">EV</Badge>}
                        </div>
                        <span className="text-[10px] font-mono text-smartTextSecondary block">
                          {v.licensePlate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(v);
                            setVehForm({
                              make: v.make || '',
                              model: v.model || '',
                              licensePlate: v.licensePlate || '',
                              color: v.color || '',
                              isEV: !!v.isEV,
                            });
                            setIsEditVehicleOpen(true);
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5 text-smartTextSecondary hover:text-signature" />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVehicleToDelete(v);
                            setIsDeleteVehicleOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-smartTextSecondary hover:text-occupied" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: PREFERENCES, INTELLIGENCE, SAVED, BOOKINGS & NOTIFICATIONS */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* -------------------------------------------------- */}
            {/* 9. SMARTPARK INTELLIGENCE PROFILE */}
            {/* -------------------------------------------------- */}
            <Card variant="elevated" padding="lg" className="border-aiBlue/30 bg-gradient-to-r from-smartElevated via-smartSurface to-aiBlue/10 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-aiBlue/10 border border-aiBlue/30 flex items-center justify-center text-aiBlue">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                      SmartPark Intelligence Profile
                    </h3>
                    <p className="text-[11px] text-smartTextSecondary">
                      Live AI recommendation parameters based on your account activity
                    </p>
                  </div>
                </div>
                <Badge variant="ai" className="self-start sm:self-auto">
                  AI ACTIVE
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-smartBg/60 border border-smartBorder/60 p-3 rounded-smart">
                  <span className="text-[9px] font-mono uppercase text-smartTextSecondary block mb-1">
                    Walking Distance
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-signature">HIGH</span>
                    <span className="text-[9px] text-smartTextSecondary font-mono">&lt; 5 min</span>
                  </div>
                </div>

                <div className="bg-smartBg/60 border border-smartBorder/60 p-3 rounded-smart">
                  <span className="text-[9px] font-mono uppercase text-smartTextSecondary block mb-1">
                    Price Sensitivity
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-limited">MEDIUM</span>
                    <span className="text-[9px] text-smartTextSecondary font-mono">Balanced</span>
                  </div>
                </div>

                <div className="bg-smartBg/60 border border-smartBorder/60 p-3 rounded-smart">
                  <span className="text-[9px] font-mono uppercase text-smartTextSecondary block mb-1">
                    EV Preference
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-signature">HIGH</span>
                    <span className="text-[9px] text-smartTextSecondary font-mono">Priority</span>
                  </div>
                </div>

                <div className="bg-smartBg/60 border border-smartBorder/60 p-3 rounded-smart">
                  <span className="text-[9px] font-mono uppercase text-smartTextSecondary block mb-1">
                    Covered Parking
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-signature">HIGH</span>
                    <span className="text-[9px] text-smartTextSecondary font-mono">Roof/Shade</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-sans text-smartTextSecondary italic flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-aiBlue shrink-0" />
                These preferences will be used by SmartPark Intelligence when ranking parking options.
              </p>
            </Card>

            {/* -------------------------------------------------- */}
            {/* 4. PARKING PREFERENCES */}
            {/* -------------------------------------------------- */}
            <Card variant="default" padding="lg" className="space-y-5">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-signature" />
                  Parking Preferences
                </h3>
                <span className="text-[10px] font-mono text-smartTextSecondary">
                  Auto-saved to session
                </span>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => handlePreferenceToggle('evParking')}
                  className={`cursor-pointer p-3.5 rounded-smart border transition-all flex items-center justify-between ${
                    preferences.evParking
                      ? 'bg-signature/5 border-signature/40'
                      : 'bg-smartSurface border-smartBorder'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className={`h-4 w-4 ${preferences.evParking ? 'text-signature' : 'text-smartTextSecondary'}`} />
                    <div>
                      <div className="text-xs font-semibold text-smartTextPrimary">Prefer EV Charging</div>
                      <div className="text-[10px] text-smartTextSecondary">Filter facilities with active chargers</div>
                    </div>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      preferences.evParking ? 'bg-signature' : 'bg-smartBorder'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-smartBg transition-transform ${
                        preferences.evParking ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                <div
                  onClick={() => handlePreferenceToggle('coveredParking')}
                  className={`cursor-pointer p-3.5 rounded-smart border transition-all flex items-center justify-between ${
                    preferences.coveredParking
                      ? 'bg-signature/5 border-signature/40'
                      : 'bg-smartSurface border-smartBorder'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className={`h-4 w-4 ${preferences.coveredParking ? 'text-signature' : 'text-smartTextSecondary'}`} />
                    <div>
                      <div className="text-xs font-semibold text-smartTextPrimary">Prefer Covered Parking</div>
                      <div className="text-[10px] text-smartTextSecondary">Indoor / Garage facilities</div>
                    </div>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      preferences.coveredParking ? 'bg-signature' : 'bg-smartBorder'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-smartBg transition-transform ${
                        preferences.coveredParking ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                <div
                  onClick={() => handlePreferenceToggle('lowerPrice')}
                  className={`cursor-pointer p-3.5 rounded-smart border transition-all flex items-center justify-between ${
                    preferences.lowerPrice
                      ? 'bg-signature/5 border-signature/40'
                      : 'bg-smartSurface border-smartBorder'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-smartTextSecondary">$</span>
                    <div>
                      <div className="text-xs font-semibold text-smartTextPrimary">Prefer Lower Price</div>
                      <div className="text-[10px] text-smartTextSecondary">Prioritize lowest hourly rates</div>
                    </div>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      preferences.lowerPrice ? 'bg-signature' : 'bg-smartBorder'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-smartBg transition-transform ${
                        preferences.lowerPrice ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                <div
                  onClick={() => handlePreferenceToggle('shorterWalk')}
                  className={`cursor-pointer p-3.5 rounded-smart border transition-all flex items-center justify-between ${
                    preferences.shorterWalk
                      ? 'bg-signature/5 border-signature/40'
                      : 'bg-smartSurface border-smartBorder'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`h-4 w-4 ${preferences.shorterWalk ? 'text-signature' : 'text-smartTextSecondary'}`} />
                    <div>
                      <div className="text-xs font-semibold text-smartTextPrimary">Prefer Shorter Walk</div>
                      <div className="text-[10px] text-smartTextSecondary">Minimize distance to destination</div>
                    </div>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      preferences.shorterWalk ? 'bg-signature' : 'bg-smartBorder'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-smartBg transition-transform ${
                        preferences.shorterWalk ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Select Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Select
                  label="Preferred Search Radius"
                  options={RADIUS_OPTIONS}
                  value={preferences.parkingRadius}
                  onChange={(e) => handlePreferenceSelect('parkingRadius', e.target.value)}
                />

                <Select
                  label="Default Parking Zone"
                  options={ZONE_OPTIONS}
                  value={preferences.defaultZone}
                  onChange={(e) => handlePreferenceSelect('defaultZone', e.target.value)}
                />
              </div>
            </Card>

            {/* -------------------------------------------------- */}
            {/* 5. SAVED PARKING */}
            {/* -------------------------------------------------- */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-signature" />
                  Saved Parking Facilities ({savedFacilities.length})
                </h3>
              </div>

              {savedFacilities.length === 0 ? (
                <EmptyState
                  title="No saved parking facilities"
                  description="You have not saved any parking locations yet. Explore the Live Map to bookmark facilities."
                  actionText="Browse Live Map"
                  onAction={() => window.location.href = '/map'}
                />
              ) : (
                <div className="space-y-3">
                  {savedFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="p-4 rounded-smart bg-smartSurface/70 border border-smartBorder/70 hover:border-smartBorder transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold font-display text-smartTextPrimary">
                            {facility.name}
                          </h4>
                          <StatusBadge status={facility.availability} />
                        </div>

                        <div className="flex items-center gap-3 text-xs text-smartTextSecondary flex-wrap font-sans">
                          <span>Dist: <strong className="text-smartTextPrimary font-mono">{facility.distance}</strong></span>
                          <span>•</span>
                          <span>ETA: <strong className="text-smartTextPrimary font-mono">{facility.walkingEta}</strong></span>
                          <span>•</span>
                          <span>Rate: <strong className="text-signature font-mono">{facility.price}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {facility.hasEv && <Badge variant="signature">EV CHARGER</Badge>}
                          {facility.isCovered && <Badge variant="default">COVERED</Badge>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSavedFacility(facility.id, facility.name)}
                          aria-label={`Remove ${facility.name}`}
                          className="hover:text-occupied text-smartTextSecondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>

                        <Link href="/map">
                          <Button variant="secondary" size="sm" className="text-xs">
                            View Parking
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* -------------------------------------------------- */}
            {/* 6. RECENT BOOKINGS */}
            {/* -------------------------------------------------- */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                  <History className="h-4 w-4 text-signature" />
                  Recent Bookings
                </h3>
                <Link href="/bookings">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-signature">
                    View All Bookings &rarr;
                  </Button>
                </Link>
              </div>

              {loadingBookings ? (
                <div className="text-xs text-smartTextSecondary py-4 text-center">Loading recent bookings...</div>
              ) : recentBookings.length === 0 ? (
                <div className="text-xs text-smartTextSecondary py-4 text-center">No recent bookings.</div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3.5 rounded-smart bg-smartSurface/50 border border-smartBorder/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-smartTextPrimary font-display">
                          {booking.facilityName}
                        </span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-smartTextSecondary font-mono">
                        <span>{booking.date}</span>
                        <span>•</span>
                        <span>{booking.time}</span>
                        <span>•</span>
                        <span>Slot: {booking.slot}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs font-bold font-mono text-smartTextPrimary">
                        {booking.amount}
                      </span>
                      <span className="text-[10px] font-mono text-smartTextSecondary uppercase">
                        ID: {booking.id}
                      </span>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </Card>

            {/* -------------------------------------------------- */}
            {/* 7. NOTIFICATION PREFERENCES */}
            {/* -------------------------------------------------- */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between border-b border-smartBorder/50 pb-3">
                <h3 className="text-xs font-semibold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                  <Bell className="h-4 w-4 text-signature" />
                  Notification Preferences
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div
                  onClick={() => handleNotificationToggle('availabilityAlerts')}
                  className="cursor-pointer p-3 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-smartTextPrimary">Parking Availability Alerts</div>
                    <div className="text-[10px] text-smartTextSecondary">Instant alerts when spots open up in preferred zones</div>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full transition-colors p-0.5 ${notifications.availabilityAlerts ? 'bg-signature' : 'bg-smartBorder'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-smartBg transition-transform ${notifications.availabilityAlerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div
                  onClick={() => handleNotificationToggle('bookingReminders')}
                  className="cursor-pointer p-3 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-smartTextPrimary">Booking Reminders</div>
                    <div className="text-[10px] text-smartTextSecondary">Timely notifications before reservation start and end times</div>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full transition-colors p-0.5 ${notifications.bookingReminders ? 'bg-signature' : 'bg-smartBorder'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-smartBg transition-transform ${notifications.bookingReminders ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div
                  onClick={() => handleNotificationToggle('aiRecommendationAlerts')}
                  className="cursor-pointer p-3 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-smartTextPrimary">AI Recommendation Alerts</div>
                    <div className="text-[10px] text-smartTextSecondary">Smart insights on price drops and optimal arrival times</div>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full transition-colors p-0.5 ${notifications.aiRecommendationAlerts ? 'bg-signature' : 'bg-smartBorder'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-smartBg transition-transform ${notifications.aiRecommendationAlerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div
                  onClick={() => handleNotificationToggle('promotionalNotifications')}
                  className="cursor-pointer p-3 rounded-smart bg-smartSurface/60 border border-smartBorder/60 hover:border-smartBorder transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-smartTextPrimary">Promotional & System Updates</div>
                    <div className="text-[10px] text-smartTextSecondary">News regarding new parking networks and feature releases</div>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full transition-colors p-0.5 ${notifications.promotionalNotifications ? 'bg-signature' : 'bg-smartBorder'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-smartBg transition-transform ${notifications.promotionalNotifications ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </main>

      {/* -------------------------------------------------- */}
      {/* MODALS */}
      {/* -------------------------------------------------- */}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            error={editErrors.name}
          />
          <Input
            label="Email Address"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            error={editErrors.email}
          />
          <Input
            label="Phone Number"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            error={editErrors.phone}
          />
          <Input
            label="Preferred Location / Area"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            error={editErrors.location}
          />

          <div className="pt-4 border-t border-smartBorder flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Info Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded bg-signature/10 border border-signature/30 text-signature">
            <Lock className="h-5 w-5 shrink-0" />
            <p className="text-xs font-sans">
              Password management and multi-factor authentication will be connected to backend authentication services in a future release.
            </p>
          </div>
          <p className="text-xs text-smartTextSecondary leading-relaxed">
            Your current account session is secured via local JWT tokens. Real credential modification requires active authentication database connection.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsPasswordModalOpen(false)}>
              Understand & Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Privacy & Data Policy"
      >
        <div className="space-y-3 text-xs text-smartTextSecondary">
          <p className="text-smartTextPrimary font-semibold">
            SmartPark AI 2.0 Privacy Guarantee
          </p>
          <p>
            Your location telemetry, parking preferences, and vehicle telemetry are encrypted end-to-end. We do not sell or distribute personal navigation records to third-party data brokers.
          </p>
          <p>
            AI recommendations utilize aggregated occupancy patterns to optimize city traffic flow without compromising individual user identity.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsPrivacyModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="Terms of Service"
      >
        <div className="space-y-3 text-xs text-smartTextSecondary">
          <p className="text-smartTextPrimary font-semibold">
            SmartPark AI Terms & Operating Rules
          </p>
          <p>
            By utilizing SmartPark AI 2.0 services, you agree to follow facility guidance, parking spot reservations, and parking zone speed limits.
          </p>
          <p>
            Spot reservations are guaranteed up to 15 minutes past the scheduled arrival window. Unclaimed spots are automatically re-routed by the AI dispatch engine.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsTermsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Session Logout"
      >
        <div className="space-y-4">
          <p className="text-xs text-smartTextSecondary">
            Are you sure you want to end your current SmartPark AI operator session?
          </p>
          <div className="p-3 rounded bg-smartSurface border border-smartBorder text-[11px] font-mono text-smartTextSecondary">
            Session user: <span className="text-smartTextPrimary font-bold">{profile.email}</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-occupied hover:bg-occupied/90 border-occupied text-white"
              onClick={() => {
                authService.logout();
                setIsLogoutModalOpen(false);
                showToast('Mock session signed out successfully.', 'info');
                setTimeout(() => {
                  router.push('/');
                }, 1000);
              }}
            >
              Confirm Log Out
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title="Register New Vehicle"
      >
        <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs font-sans text-smartTextSecondary">
          <Input
            label="Make (e.g. Honda)"
            value={vehForm.make}
            onChange={(e) => setVehForm({ ...vehForm, make: e.target.value })}
            placeholder="Honda"
            required
          />
          <Input
            label="Model (e.g. City)"
            value={vehForm.model}
            onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })}
            placeholder="City"
            required
          />
          <Input
            label="License Plate / Registration"
            value={vehForm.licensePlate}
            onChange={(e) => setVehForm({ ...vehForm, licensePlate: e.target.value })}
            placeholder="MH-01-AB-1234"
            required
          />
          <Input
            label="Color (Optional)"
            value={vehForm.color}
            onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
            placeholder="White"
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isEV"
              checked={vehForm.isEV}
              onChange={(e) => setVehForm({ ...vehForm, isEV: e.target.checked })}
              className="rounded bg-smartSurface border border-smartBorder text-signature focus:ring-signature h-4 w-4"
            />
            <label htmlFor="isEV" className="select-none text-xs text-smartTextPrimary font-medium">
              This is an Electric Vehicle (EV)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddVehicleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={isEditVehicleOpen}
        onClose={() => setIsEditVehicleOpen(false)}
        title="Edit Registered Vehicle"
      >
        <form onSubmit={handleEditVehicleSubmit} className="space-y-4 text-xs font-sans text-smartTextSecondary">
          <Input
            label="Make"
            value={vehForm.make}
            onChange={(e) => setVehForm({ ...vehForm, make: e.target.value })}
            required
          />
          <Input
            label="Model"
            value={vehForm.model}
            onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })}
            required
          />
          <Input
            label="License Plate / Registration"
            value={vehForm.licensePlate}
            onChange={(e) => setVehForm({ ...vehForm, licensePlate: e.target.value })}
            required
          />
          <Input
            label="Color (Optional)"
            value={vehForm.color}
            onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editIsEV"
              checked={vehForm.isEV}
              onChange={(e) => setVehForm({ ...vehForm, isEV: e.target.checked })}
              className="rounded bg-smartSurface border border-smartBorder text-signature focus:ring-signature h-4 w-4"
            />
            <label htmlFor="editIsEV" className="select-none text-xs text-smartTextPrimary font-medium">
              This is an Electric Vehicle (EV)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditVehicleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Vehicle Confirmation Modal */}
      <Modal
        isOpen={isDeleteVehicleOpen}
        onClose={() => {
          setIsDeleteVehicleOpen(false);
          setVehicleToDelete(null);
        }}
        title="Delete Registered Vehicle?"
      >
        <div className="space-y-4 text-xs font-sans text-smartTextSecondary text-left">
          <div className="flex items-start gap-2.5 bg-occupied/10 border border-occupied/30 p-3 rounded-lg text-occupied">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[11px] uppercase font-mono">Irreversible Action</h4>
              <p className="text-[10px] mt-0.5 text-occupied/90 leading-relaxed">
                Deleting vehicle profile registrations will clear ANPR scanner configurations at entrance gates.
              </p>
            </div>
          </div>

          {vehicleToDelete && (
            <div className="bg-smartBg border border-smartBorder/60 p-3.5 rounded-lg flex flex-col gap-2 font-mono">
              <div className="flex justify-between border-b border-smartBorder/30 pb-1.5">
                <span className="text-smartTextSecondary">Vehicle:</span>
                <span className="text-white font-bold">{vehicleToDelete.make} {vehicleToDelete.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-smartTextSecondary">Registration:</span>
                <span className="text-white">{vehicleToDelete.licensePlate}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-smartBorder">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsDeleteVehicleOpen(false);
                setVehicleToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-occupied text-white hover:bg-occupied/80 border-transparent h-9 px-4 font-mono uppercase tracking-wider text-[10px]"
              onClick={handleDeleteVehicle}
            >
              Delete Vehicle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
