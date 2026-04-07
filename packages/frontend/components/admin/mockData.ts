// Admin dashboard types and mock data

export type AdminRole = {
  role: 'center_admin' | 'event_admin';
  resourceType: 'center' | 'event';
  resourceId: string;
  resourceName: string;
};

export type AdminCenter = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  acharya: string;
  pointOfContact: string;
  memberCount: number;
  isVerified: boolean;
  image: string | null;
};

export type AdminEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  centerName: string;
  centerId: string;
  attendeeCount: number;
  description: string;
  createdBy: string;
  image: string | null;
};

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  centerName: string | null;
  centerId: string | null;
  isVerified: boolean;
  verificationLevel: number;
  createdAt: string;
  roles: AdminRole[];
};

// --- Mock Data ---

export const MOCK_CENTERS: AdminCenter[] = [
  {
    id: 'center-sanjose-001',
    name: 'CM San Jose',
    address: '1050 S White Rd',
    city: 'San Jose',
    state: 'CA',
    phone: '(408) 555-0101',
    website: 'https://chinmayamission.com/sanjose',
    acharya: 'Swami Siddhananda',
    pointOfContact: 'Kish Parikh',
    memberCount: 142,
    isVerified: true,
    image: null,
  },
  {
    id: 'center-houston-002',
    name: 'CM Houston',
    address: '10353 FM 1960 W',
    city: 'Houston',
    state: 'TX',
    phone: '(713) 555-0202',
    website: 'https://chinmayamission.com/houston',
    acharya: 'Swami Ishwarananda',
    pointOfContact: 'Ravi Kumar',
    memberCount: 89,
    isVerified: false,
    image: null,
  },
  {
    id: 'center-tristate-003',
    name: 'CM Tri-State',
    address: '2 Fennimore Rd',
    city: 'Cranbury',
    state: 'NJ',
    phone: '(732) 555-0303',
    website: 'https://chinmayamission.com/tristate',
    acharya: 'Swami Shantananda',
    pointOfContact: 'Meera Shah',
    memberCount: 213,
    isVerified: true,
    image: null,
  },
  {
    id: 'center-chicago-004',
    name: 'CM Chicago',
    address: '1N020 Timber Trail',
    city: 'Wheaton',
    state: 'IL',
    phone: '(630) 555-0404',
    website: 'https://chinmayamission.com/chicago',
    acharya: 'Swami Sharanananda',
    pointOfContact: 'Anita Desai',
    memberCount: 67,
    isVerified: true,
    image: null,
  },
];

export const MOCK_EVENTS: AdminEvent[] = [
  {
    id: 'event-001',
    title: 'Gita Chanting',
    date: '2026-04-05T10:00:00.000Z',
    time: '10:00 AM',
    location: 'CM San Jose',
    address: '1050 S White Rd, San Jose, CA',
    centerName: 'CM San Jose',
    centerId: 'center-sanjose-001',
    attendeeCount: 23,
    description:
      'Weekly Bhagavad Gita chanting session. All chapters covered on a rotating basis.',
    createdBy: 'kish_parikh',
    image: null,
  },
  {
    id: 'event-002',
    title: 'Youth Retreat',
    date: '2026-04-12T09:00:00.000Z',
    time: '9:00 AM',
    location: 'CM Houston',
    address: '10353 FM 1960 W, Houston, TX',
    centerName: 'CM Houston',
    centerId: 'center-houston-002',
    attendeeCount: 45,
    description:
      'Annual spring youth retreat with workshops on Vedanta, team activities, and cultural programs.',
    createdBy: 'ravi_kumar',
    image: null,
  },
  {
    id: 'event-003',
    title: 'Vedanta Course',
    date: '2026-04-08T19:00:00.000Z',
    time: '7:00 PM',
    location: 'CM Tri-State',
    address: '2 Fennimore Rd, Cranbury, NJ',
    centerName: 'CM Tri-State',
    centerId: 'center-tristate-003',
    attendeeCount: 31,
    description:
      'Introductory Vedanta course covering key texts and principles. Open to all.',
    createdBy: 'meera_shah',
    image: null,
  },
  {
    id: 'event-004',
    title: 'Bala Vihar',
    date: '2026-04-06T11:00:00.000Z',
    time: '11:00 AM',
    location: 'CM Chicago',
    address: '1N020 Timber Trail, Wheaton, IL',
    centerName: 'CM Chicago',
    centerId: 'center-chicago-004',
    attendeeCount: 18,
    description:
      'Weekly Bala Vihar class for children ages 5-15. Stories, shlokas, and value-based activities.',
    createdBy: 'anita_desai',
    image: null,
  },
];

export const MOCK_USERS: AdminUser[] = [
  {
    id: 'user-001',
    username: 'kish_parikh',
    email: 'kish@example.com',
    firstName: 'Kish',
    lastName: 'Parikh',
    profileImage: null,
    centerName: 'CM San Jose',
    centerId: 'center-sanjose-001',
    isVerified: true,
    verificationLevel: 107,
    createdAt: '2025-01-15T08:00:00.000Z',
    roles: [
      {
        role: 'center_admin',
        resourceType: 'center',
        resourceId: 'center-sanjose-001',
        resourceName: 'CM San Jose',
      },
    ],
  },
  {
    id: 'user-002',
    username: 'abhiram_r',
    email: 'abhiram@example.com',
    firstName: 'Abhiram',
    lastName: 'Ramachandran',
    profileImage: null,
    centerName: 'CM San Jose',
    centerId: 'center-sanjose-001',
    isVerified: true,
    verificationLevel: 1,
    createdAt: '2025-02-20T12:00:00.000Z',
    roles: [
      {
        role: 'center_admin',
        resourceType: 'center',
        resourceId: 'center-sanjose-001',
        resourceName: 'CM San Jose',
      },
    ],
  },
  {
    id: 'user-003',
    username: 'sahanav_r',
    email: 'sahanav@example.com',
    firstName: 'Sahanav',
    lastName: 'Ramesh',
    profileImage: null,
    centerName: null,
    centerId: null,
    isVerified: true,
    verificationLevel: 1,
    createdAt: '2025-03-10T15:30:00.000Z',
    roles: [],
  },
  {
    id: 'user-004',
    username: 'ravi_kumar',
    email: 'ravi@example.com',
    firstName: 'Ravi',
    lastName: 'Kumar',
    profileImage: null,
    centerName: 'CM Houston',
    centerId: 'center-houston-002',
    isVerified: false,
    verificationLevel: 0,
    createdAt: '2025-04-01T09:00:00.000Z',
    roles: [
      {
        role: 'event_admin',
        resourceType: 'event',
        resourceId: 'event-002',
        resourceName: 'Youth Retreat',
      },
    ],
  },
  {
    id: 'user-005',
    username: 'meera_shah',
    email: 'meera@example.com',
    firstName: 'Meera',
    lastName: 'Shah',
    profileImage: null,
    centerName: 'CM Tri-State',
    centerId: 'center-tristate-003',
    isVerified: true,
    verificationLevel: 1,
    createdAt: '2025-02-05T11:00:00.000Z',
    roles: [
      {
        role: 'center_admin',
        resourceType: 'center',
        resourceId: 'center-tristate-003',
        resourceName: 'CM Tri-State',
      },
    ],
  },
];

