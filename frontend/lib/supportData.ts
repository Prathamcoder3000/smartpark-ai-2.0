export type SupportCategoryType = 'PARKING' | 'BOOKINGS' | 'PAYMENTS' | 'ACCOUNT' | 'SMARTPARK AI' | 'OPERATOR';

export interface SupportCategory {
  id: SupportCategoryType;
  name: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: SupportCategoryType;
}

export interface SupportContactOption {
  id: string;
  name: string;
  description: string;
  details: string;
  actionText: string;
}

export interface SupportTicket {
  id: string;
  issueType: string;
  facilityId: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface SupportArticle {
  id: string;
  title: string;
  category: SupportCategoryType;
  views: number;
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: 'PARKING',
    name: 'Parking & Facilities',
    description: 'Find, access, and navigate to physical parking spots.'
  },
  {
    id: 'BOOKINGS',
    name: 'Bookings & Permits',
    description: 'Manage active, upcoming, and past reservations.'
  },
  {
    id: 'PAYMENTS',
    name: 'Billing & Rates',
    description: 'Pricing structures, refunds, and digital pass billing.'
  },
  {
    id: 'ACCOUNT',
    name: 'Account & Profile',
    description: 'Manage user access, security, and preferences.'
  },
  {
    id: 'SMARTPARK AI',
    name: 'AI & Intelligence',
    description: 'Understand occupancy forecasts, predictions, and recommendations.'
  },
  {
    id: 'OPERATOR',
    name: 'Operator Hub',
    description: 'Help guides for facility operators and lot managers.'
  }
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'PARKING',
    question: 'How do I find available parking?',
    answer: 'Navigate to the Search page or Live Map page. You can input your destination or landmark, and SmartPark will display nearby facilities sorted by proximity, price, and current availability.'
  },
  {
    id: 'faq-2',
    category: 'SMARTPARK AI',
    question: 'How does SmartPark recommend a facility?',
    answer: 'Our AI model calculates a Recommendation Score based on real-time factors: walking distance, current occupancy stability, locked pricing tiers, and your personal preferences (e.g., covered parking or EV charging).'
  },
  {
    id: 'faq-3',
    category: 'ACCOUNT',
    question: 'How do I view my parking pass?',
    answer: 'Go to your Profile page. Under the account summary, you will see a QR code pass. This pass is scanned at smart gate barriers for rapid verification.'
  },
  {
    id: 'faq-4',
    category: 'BOOKINGS',
    question: 'How do I cancel a reservation?',
    answer: 'Navigate to the Bookings page, find your active or upcoming reservation under the dashboard, click "Cancel Reservation", and confirm. Refunds are initiated instantly under our standard grace period policy.'
  },
  {
    id: 'faq-5',
    category: 'SMARTPARK AI',
    question: 'How does predicted availability work?',
    answer: 'The AI occupancy model analyses historical telemetry, peak commute windows, day of the week, and live sensor signals to estimate occupancy for +30, +60, +90, and +120 minutes out.'
  },
  {
    id: 'faq-6',
    category: 'ACCOUNT',
    question: 'How do I update my parking preferences?',
    answer: 'Open the Profile page, click on "Edit Preferences", and toggle settings like EV Charging Required, Covered Parking Preferred, or Maximum Distance limits.'
  },
  {
    id: 'faq-7',
    category: 'PARKING',
    question: 'What happens if a parking facility becomes full?',
    answer: 'If occupancy reaches 100%, the status changes to OCCUPIED on the map and search layouts. SmartPark AI will suggest the next best available alternative (e.g. nearby surface plazas) with moderate demand.'
  },
  {
    id: 'faq-8',
    category: 'BOOKINGS',
    question: 'How do I contact support?',
    answer: 'You can scroll down on this support page and use the Contact Channels options or submit an issue report form directly below for prototype operations.'
  }
];

export const MOCK_CONTACT_OPTIONS: SupportContactOption[] = [
  {
    id: 'contact-help',
    name: 'Help Center',
    description: 'Read detailed guides and system operational documentations.',
    details: 'Documentation portal',
    actionText: 'Open Portal'
  },
  {
    id: 'contact-email',
    name: 'Support Email',
    description: 'Open a detailed support inquiry ticket with our representative desk.',
    details: 'Support channel available after backend integration.',
    actionText: 'Email Desk'
  },
  {
    id: 'contact-ops',
    name: 'Parking Operations',
    description: 'Urgent assistance with gates, barriers, or dynamic occupancy sensors.',
    details: 'Operations desk hotline',
    actionText: 'Call Ops'
  },
  {
    id: 'contact-account',
    name: 'Account Support',
    description: 'Resolve credential locks, identity validation, or payment method resets.',
    details: 'Billing verification desk',
    actionText: 'Resolve Issue'
  }
];
