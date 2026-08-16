export type NotificationType = 'AVAILABILITY' | 'BOOKING' | 'AI_INSIGHT' | 'SYSTEM' | 'PROMOTION';
export type NotificationPriority = 'INFO' | 'IMPORTANT' | 'CRITICAL';
export type NotificationFilter = 'ALL' | 'UNREAD' | 'BOOKING' | 'AVAILABILITY' | 'AI_INSIGHT' | 'SYSTEM' | 'PROMOTION';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  relatedFacilityId?: string; // slug e.g. "metro-central-garage" or "cyber-city-hub"
  relatedRoute?: string; // e.g. "/bookings" or "/map" or "/intelligence"
}

export const INITIAL_MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'AVAILABILITY',
    priority: 'INFO',
    title: 'Metro Central Garage status update',
    description: 'Metro Central Garage now has 142 available bays. Occupancy has stabilized to 29% for the next 2 hours.',
    timestamp: '10 mins ago',
    isRead: false,
    relatedFacilityId: 'metro-central-garage'
  },
  {
    id: 'notif-2',
    type: 'BOOKING',
    priority: 'IMPORTANT',
    title: 'Upcoming Cyber City Reservation',
    description: 'Your Cyber City Hub reservation starts in 45 minutes. Smart gates will automatically scan your vehicle registration.',
    timestamp: '25 mins ago',
    isRead: false,
    relatedRoute: '/bookings'
  },
  {
    id: 'notif-3',
    type: 'AI_INSIGHT',
    priority: 'IMPORTANT',
    title: 'Predicted Peak Occupancy Alert',
    description: 'SmartPark AI predicts rising demand around 18:00 in Zone A (Financial District). We recommend securing a spot now.',
    timestamp: '1 hour ago',
    isRead: false,
    relatedRoute: '/intelligence'
  },
  {
    id: 'notif-4',
    type: 'SYSTEM',
    priority: 'INFO',
    title: 'Digital Parking Pass Activated',
    description: 'Your digital parking pass is ready. Open the Profile page to access your QR code for rapid barrier verification.',
    timestamp: '3 hours ago',
    isRead: true,
    relatedRoute: '/profile'
  },
  {
    id: 'notif-5',
    type: 'AVAILABILITY',
    priority: 'CRITICAL',
    title: 'TechPark Parking Approaching Capacity',
    description: 'TechPark occupancy is approaching 90% (only 18 bays remaining). Search times are predicted to increase by 8 minutes.',
    timestamp: '4 hours ago',
    isRead: false,
    relatedFacilityId: 'techpark-parking'
  },
  {
    id: 'notif-6',
    type: 'PROMOTION',
    priority: 'INFO',
    title: 'Weekend Parking Discount',
    description: 'Enjoy 20% off at all Zone A facilities this Saturday and Sunday. Offer applied automatically on booking.',
    timestamp: '1 day ago',
    isRead: true
  }
];
