import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────
// Helper data pools
// ──────────────────────────────────────────────

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts',
];

const streetNames = [
  'Oak St', 'Maple Ave', 'Cedar Ln', 'Pine Dr', 'Elm St', 'Washington Blvd',
  'Park Ave', 'Lake Dr', 'Hill Rd', 'Forest Way', 'Sunset Blvd', 'River Rd',
  'Spring St', 'Valley Dr', 'Meadow Ln', 'Church St', 'Main St', 'Highland Ave',
  'Walnut St', 'Chestnut Dr', 'Birch Ln', 'Willow Way', 'Dogwood Ct', 'Magnolia Dr',
  'Peachtree Rd',
];

const cities: Array<{ city: string; state: string; zip: string }> = [
  { city: 'Phoenix', state: 'AZ', zip: '85001' },
  { city: 'Houston', state: 'TX', zip: '77001' },
  { city: 'Dallas', state: 'TX', zip: '75201' },
  { city: 'San Antonio', state: 'TX', zip: '78201' },
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Atlanta', state: 'GA', zip: '30301' },
  { city: 'Charlotte', state: 'NC', zip: '28201' },
  { city: 'Nashville', state: 'TN', zip: '37201' },
  { city: 'Tampa', state: 'FL', zip: '33601' },
  { city: 'Orlando', state: 'FL', zip: '32801' },
  { city: 'Jacksonville', state: 'FL', zip: '32099' },
  { city: 'Denver', state: 'CO', zip: '80201' },
  { city: 'Las Vegas', state: 'NV', zip: '89101' },
  { city: 'Raleigh', state: 'NC', zip: '27601' },
  { city: 'Indianapolis', state: 'IN', zip: '46201' },
  { city: 'Columbus', state: 'OH', zip: '43201' },
  { city: 'Kansas City', state: 'MO', zip: '64101' },
  { city: 'Memphis', state: 'TN', zip: '38101' },
  { city: 'Sacramento', state: 'CA', zip: '95814' },
  { city: 'Tucson', state: 'AZ', zip: '85701' },
  { city: 'Oklahoma City', state: 'OK', zip: '73101' },
  { city: 'Louisville', state: 'KY', zip: '40201' },
  { city: 'Richmond', state: 'VA', zip: '23219' },
  { city: 'Birmingham', state: 'AL', zip: '35201' },
  { city: 'St. Louis', state: 'MO', zip: '63101' },
];

const equipmentTypes = ['AC', 'Furnace', 'HeatPump', 'Boiler'];
const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'DORMANT', 'ACTIVE', 'CHURNED'];
const estimateStatuses = ['NONE', 'SENT', 'FOLLOW_UP', 'ACCEPTED', 'DECLINED'];
const membershipStatuses = ['NONE', 'ACTIVE', 'LAPSED', 'EXPIRED'];
const tagOptions = ['VIP', 'High-Value', 'At-Risk', 'Referral-Source', 'Commercial-Priority', 'New-Homeowner'];

// ──────────────────────────────────────────────
// Utility functions
// ──────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomPhone(): string {
  const area = randomInt(200, 999);
  const mid = randomInt(200, 999);
  const end = randomInt(1000, 9999);
  return `(${area}) ${mid}-${end}`;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function randomPastDate(minDaysAgo: number, maxDaysAgo: number): Date {
  return daysAgo(randomInt(minDaysAgo, maxDaysAgo));
}

// ──────────────────────────────────────────────
// Generate customers
// ──────────────────────────────────────────────

function generateCustomers() {
  const customers = [];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const location = pick(cities);
    const streetNum = randomInt(100, 9999);
    const street = pick(streetNames);

    // Weighted lead status — more NEW and DORMANT to reflect realistic distribution
    const leadStatus = pickWeighted(
      leadStatuses,
      [25, 10, 10, 25, 20, 10], // NEW, CONTACTED, QUALIFIED, DORMANT, ACTIVE, CHURNED
    );

    const customerType = pickWeighted(['RESIDENTIAL', 'COMMERCIAL'], [85, 15]);

    // ~40% of customers have an open estimate
    const hasEstimate = Math.random() < 0.4;
    const estimateAmount = hasEstimate ? randomFloat(800, 12000) : null;
    const estimateStatus = hasEstimate
      ? pickWeighted(estimateStatuses.slice(1), [30, 25, 20, 25]) // exclude NONE
      : 'NONE';

    // Membership distribution
    const membershipStatus = pickWeighted(membershipStatuses, [40, 25, 20, 15]);

    // Tags — ~30% of customers get tags
    let tags: string | null = null;
    if (Math.random() < 0.3) {
      const numTags = randomInt(1, 3);
      const selectedTags = new Set<string>();
      while (selectedTags.size < numTags) {
        selectedTags.add(pick(tagOptions));
      }
      tags = Array.from(selectedTags).join(',');
    }

    // Last service date: 30 days ago to 3 years ago
    const hasServiceDate = Math.random() < 0.85;
    const lastServiceDate = hasServiceDate ? randomPastDate(30, 1095) : null;

    // Notes for some customers
    let notes: string | null = null;
    const noteOptions = [
      'Prefers morning appointments.',
      'Has a large commercial building with multiple units.',
      'Interested in upgrading to a heat pump system.',
      'Previous water damage issue near HVAC unit.',
      'Repeat customer — always pays on time.',
      'Requested quote for ductwork replacement.',
      'Hard to reach by phone, prefers text.',
      'Referred by a neighbor.',
      'Warranty expiring soon — follow up.',
      'Needs annual inspection before winter.',
      null, null, null, null, null, // 50% chance of no note
    ];
    notes = pick(noteOptions);

    customers.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${pick(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'])}`,
      phone: randomPhone(),
      address: `${streetNum} ${street}`,
      city: location.city,
      state: location.state,
      zipCode: location.zip,
      equipmentType: pick(equipmentTypes),
      equipmentAge: randomInt(3, 18),
      lastServiceDate,
      leadStatus,
      customerType,
      estimateAmount,
      estimateStatus,
      membershipStatus,
      notes,
      tags,
    });
  }

  return customers;
}

// ──────────────────────────────────────────────
// Campaigns — one of each type
// ──────────────────────────────────────────────

const campaigns = [
  {
    name: 'Spring Reactivation Blitz',
    type: 'REACTIVATION',
    status: 'ACTIVE',
    targetSegment: 'Dormant customers with no service in 12+ months',
    messageTemplate:
      'Hi {{firstName}}, it\'s been a while! Your {{equipmentType}} is {{equipmentAge}} years old and due for a checkup. Book today and save 15%! Reply YES to schedule.',
    totalSent: 342,
    totalResponded: 67,
    totalConverted: 23,
    revenueRecovered: 18750.0,
  },
  {
    name: 'Open Estimate Follow-Up',
    type: 'ESTIMATE_FOLLOWUP',
    status: 'ACTIVE',
    targetSegment: 'Customers with pending estimates older than 7 days',
    messageTemplate:
      'Hi {{firstName}}, just checking in on your estimate for ${{estimateAmount}}. We can still honor this price — want to move forward? Reply or call us!',
    totalSent: 156,
    totalResponded: 41,
    totalConverted: 18,
    revenueRecovered: 42300.0,
  },
  {
    name: 'Quarterly Maintenance Reminder',
    type: 'MAINTENANCE_REMINDER',
    status: 'ACTIVE',
    targetSegment: 'Active customers with last service 90+ days ago',
    messageTemplate:
      'Hi {{firstName}}, your {{equipmentType}} is due for seasonal maintenance. Regular service extends equipment life by up to 40%. Book now: {{bookingLink}}',
    totalSent: 512,
    totalResponded: 128,
    totalConverted: 89,
    revenueRecovered: 26700.0,
  },
  {
    name: 'Google Review Request',
    type: 'REVIEW_REQUEST',
    status: 'ACTIVE',
    targetSegment: 'Customers who completed service in the last 7 days',
    messageTemplate:
      'Hi {{firstName}}, thanks for choosing us! If you had a great experience, we\'d love a quick Google review: {{reviewLink}} — it helps us a lot!',
    totalSent: 234,
    totalResponded: 52,
    totalConverted: 48,
    revenueRecovered: 0,
  },
  {
    name: 'Referral Reward Program',
    type: 'REFERRAL',
    status: 'DRAFT',
    targetSegment: 'Active and qualified customers',
    messageTemplate:
      'Hi {{firstName}}, love our service? Refer a friend and you BOTH get $50 off your next appointment! Just share this link: {{referralLink}}',
    totalSent: 0,
    totalResponded: 0,
    totalConverted: 0,
    revenueRecovered: 0,
  },
  {
    name: 'Membership Renewal Drive',
    type: 'MEMBERSHIP_RENEWAL',
    status: 'ACTIVE',
    targetSegment: 'Customers with LAPSED or EXPIRED membership',
    messageTemplate:
      'Hi {{firstName}}, your maintenance membership has lapsed. Renew now and get priority scheduling + 10% off all repairs. Reply RENEW to get started!',
    totalSent: 87,
    totalResponded: 29,
    totalConverted: 15,
    revenueRecovered: 5250.0,
  },
  {
    name: 'Summer AC Tune-Up Special',
    type: 'SEASONAL',
    status: 'PAUSED',
    targetSegment: 'All customers with AC or HeatPump equipment',
    messageTemplate:
      'Summer is here, {{firstName}}! Don\'t let your AC quit on the hottest day. Get a $79 tune-up (reg $129) before the rush. Book: {{bookingLink}}',
    totalSent: 678,
    totalResponded: 189,
    totalConverted: 134,
    revenueRecovered: 10586.0,
  },
  {
    name: 'Missed Call Text-Back',
    type: 'MISSED_CALL_TEXTBACK',
    status: 'ACTIVE',
    targetSegment: 'All missed inbound calls',
    messageTemplate:
      'Hi! We missed your call at {{companyName}}. How can we help? Reply here or we\'ll call you back shortly. For emergencies, call {{emergencyNumber}}.',
    totalSent: 1245,
    totalResponded: 623,
    totalConverted: 312,
    revenueRecovered: 78000.0,
  },
];

// ──────────────────────────────────────────────
// Default settings
// ──────────────────────────────────────────────

const defaultSettings = [
  {
    key: 'TWILIO_ACCOUNT_SID',
    value: '',
    description: 'Twilio Account SID for SMS and voice functionality',
  },
  {
    key: 'TWILIO_AUTH_TOKEN',
    value: '',
    description: 'Twilio Auth Token for API authentication',
  },
  {
    key: 'TWILIO_PHONE_NUMBER',
    value: '',
    description: 'Twilio phone number for sending SMS and making calls (E.164 format)',
  },
  {
    key: 'AI_API_KEY',
    value: '',
    description: 'API key for the AI provider (OpenAI, Anthropic, etc.)',
  },
  {
    key: 'AI_PROVIDER',
    value: '',
    description: 'AI provider to use for smart responses (openai, anthropic, gemini)',
  },
  {
    key: 'COMPANY_NAME',
    value: 'ProComfort HVAC',
    description: 'Company name used in customer-facing messages',
  },
  {
    key: 'COMPANY_PHONE',
    value: '(555) 100-2000',
    description: 'Main company phone number',
  },
  {
    key: 'EMERGENCY_PHONE',
    value: '(555) 100-2001',
    description: 'Emergency/after-hours phone number',
  },
  {
    key: 'BOOKING_URL',
    value: 'https://book.procomforthvac.com',
    description: 'Online booking page URL',
  },
  {
    key: 'GOOGLE_REVIEW_URL',
    value: '',
    description: 'Google Business review link',
  },
  {
    key: 'AUTO_TEXTBACK_ENABLED',
    value: 'true',
    description: 'Enable automatic text-back on missed calls',
  },
  {
    key: 'AUTO_TEXTBACK_DELAY_SECONDS',
    value: '30',
    description: 'Delay in seconds before sending auto text-back after missed call',
  },
  {
    key: 'BUSINESS_HOURS_START',
    value: '08:00',
    description: 'Business hours start time (24h format)',
  },
  {
    key: 'BUSINESS_HOURS_END',
    value: '18:00',
    description: 'Business hours end time (24h format)',
  },
  {
    key: 'TIMEZONE',
    value: 'America/Chicago',
    description: 'Business timezone',
  },
];

// ──────────────────────────────────────────────
// Activity log entries
// ──────────────────────────────────────────────

function generateActivityLogs(customerIds: number[], campaignIds: number[]) {
  const logs = [
    // Recent missed calls
    {
      customerId: customerIds[0],
      type: 'CALL_MISSED',
      description: `Missed call from ${randomPhone()} — auto text-back sent`,
      metadata: JSON.stringify({ duration: 0, from: randomPhone() }),
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[3],
      type: 'CALL_MISSED',
      description: `Missed call from ${randomPhone()} during after-hours`,
      metadata: JSON.stringify({ duration: 0, afterHours: true }),
      createdAt: daysAgo(0),
    },
    // Answered calls
    {
      customerId: customerIds[1],
      type: 'CALL_ANSWERED',
      description: 'Inbound call — customer requested AC repair quote',
      metadata: JSON.stringify({ duration: 245, notes: 'AC making loud noise' }),
      createdAt: daysAgo(1),
    },
    {
      customerId: customerIds[7],
      type: 'CALL_ANSWERED',
      description: 'Inbound call — scheduled furnace inspection',
      metadata: JSON.stringify({ duration: 180 }),
      createdAt: daysAgo(1),
    },
    // SMS activity
    {
      customerId: customerIds[2],
      type: 'SMS_SENT',
      description: 'Estimate follow-up SMS sent via campaign',
      metadata: JSON.stringify({ campaignId: campaignIds[1], messageId: 'msg_abc123' }),
      createdAt: daysAgo(2),
    },
    {
      customerId: customerIds[2],
      type: 'SMS_RECEIVED',
      description: 'Customer replied: "Yes, let\'s go ahead with the repair"',
      metadata: JSON.stringify({ sentiment: 'positive' }),
      createdAt: daysAgo(1),
    },
    {
      customerId: customerIds[5],
      type: 'SMS_SENT',
      description: 'Maintenance reminder SMS sent',
      metadata: JSON.stringify({ campaignId: campaignIds[2] }),
      createdAt: daysAgo(3),
    },
    // Email
    {
      customerId: customerIds[10],
      type: 'EMAIL_SENT',
      description: 'Sent detailed estimate for heat pump replacement',
      metadata: JSON.stringify({ estimateAmount: 8500, templateId: 'est_hp_replace' }),
      createdAt: daysAgo(4),
    },
    // Estimates
    {
      customerId: customerIds[4],
      type: 'ESTIMATE_SENT',
      description: 'New AC installation estimate — $6,200',
      metadata: JSON.stringify({ amount: 6200, equipmentType: 'AC', isReplacement: true }),
      createdAt: daysAgo(5),
    },
    {
      customerId: customerIds[8],
      type: 'ESTIMATE_SENT',
      description: 'Furnace repair estimate — $1,850',
      metadata: JSON.stringify({ amount: 1850, equipmentType: 'Furnace' }),
      createdAt: daysAgo(3),
    },
    // Appointments
    {
      customerId: customerIds[6],
      type: 'APPOINTMENT_BOOKED',
      description: 'AC tune-up scheduled for next Tuesday at 10am',
      metadata: JSON.stringify({ date: '2026-06-03', time: '10:00', techId: 'tech_01' }),
      createdAt: daysAgo(1),
    },
    {
      customerId: customerIds[12],
      type: 'APPOINTMENT_BOOKED',
      description: 'Heat pump installation scheduled',
      metadata: JSON.stringify({ date: '2026-06-05', time: '08:00', estimateId: 42 }),
      createdAt: daysAgo(2),
    },
    // Reviews
    {
      customerId: customerIds[9],
      type: 'REVIEW_COLLECTED',
      description: 'Customer left a 5-star Google review',
      metadata: JSON.stringify({ rating: 5, platform: 'google', snippet: 'Amazing service, very professional!' }),
      createdAt: daysAgo(2),
    },
    {
      customerId: customerIds[15],
      type: 'REVIEW_COLLECTED',
      description: 'Customer left a 4-star Google review',
      metadata: JSON.stringify({ rating: 4, platform: 'google', snippet: 'Good work, a bit pricey.' }),
      createdAt: daysAgo(6),
    },
    // Campaign triggers
    {
      customerId: null,
      type: 'CAMPAIGN_TRIGGERED',
      description: 'Spring Reactivation Blitz campaign batch sent — 45 messages',
      metadata: JSON.stringify({ campaignId: campaignIds[0], batchSize: 45 }),
      createdAt: daysAgo(7),
    },
    {
      customerId: null,
      type: 'CAMPAIGN_TRIGGERED',
      description: 'Membership Renewal Drive campaign batch sent — 22 messages',
      metadata: JSON.stringify({ campaignId: campaignIds[5], batchSize: 22 }),
      createdAt: daysAgo(5),
    },
    // A few more recent ones for dashboard feel
    {
      customerId: customerIds[18],
      type: 'CALL_MISSED',
      description: 'Missed call — text-back auto-sent',
      metadata: JSON.stringify({ duration: 0 }),
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[20],
      type: 'SMS_RECEIVED',
      description: 'Customer replied to reactivation campaign: "Can you come this week?"',
      metadata: JSON.stringify({ campaignId: campaignIds[0], sentiment: 'positive' }),
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[25],
      type: 'APPOINTMENT_BOOKED',
      description: 'Emergency AC repair — same day appointment',
      metadata: JSON.stringify({ date: '2026-05-31', time: '14:00', priority: 'emergency' }),
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[30],
      type: 'EMAIL_SENT',
      description: 'Membership renewal reminder email sent',
      metadata: JSON.stringify({ campaignId: campaignIds[5] }),
      createdAt: daysAgo(1),
    },
  ];

  return logs;
}

// ──────────────────────────────────────────────
// Main seed function
// ──────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding HVAC Revenue Recovery database...\n');

  // Clear existing data
  console.log('  🗑️  Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.settings.deleteMany();

  // Seed customers
  console.log('  👥 Creating 50 customers...');
  const customerData = generateCustomers();
  for (const customer of customerData) {
    await prisma.customer.create({ data: customer });
  }
  const allCustomers = await prisma.customer.findMany({ select: { id: true } });
  const customerIds = allCustomers.map((c) => c.id);
  console.log(`     ✅ Created ${customerIds.length} customers`);

  // Seed campaigns
  console.log('  📣 Creating campaigns...');
  for (const campaign of campaigns) {
    await prisma.campaign.create({ data: campaign });
  }
  const allCampaigns = await prisma.campaign.findMany({ select: { id: true } });
  const campaignIds = allCampaigns.map((c) => c.id);
  console.log(`     ✅ Created ${campaignIds.length} campaigns`);

  // Seed activity logs
  console.log('  📋 Creating activity logs...');
  const activityLogs = generateActivityLogs(customerIds, campaignIds);
  for (const log of activityLogs) {
    await prisma.activityLog.create({ data: log });
  }
  console.log(`     ✅ Created ${activityLogs.length} activity log entries`);

  // Seed settings
  console.log('  ⚙️  Creating default settings...');
  for (const setting of defaultSettings) {
    await prisma.settings.create({ data: setting });
  }
  console.log(`     ✅ Created ${defaultSettings.length} settings`);

  // Seed some messages
  console.log('  💬 Creating sample messages...');
  const sampleMessages = [
    {
      customerId: customerIds[0],
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: 'Hi James! We missed your call. How can we help? Reply here or we\'ll call you back shortly.',
      status: 'DELIVERED',
      campaignId: campaignIds[7], // Missed call textback
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[2],
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: 'Hi Robert, just checking in on your estimate for $4,500. We can still honor this price — want to move forward?',
      status: 'DELIVERED',
      campaignId: campaignIds[1],
      createdAt: daysAgo(2),
    },
    {
      customerId: customerIds[2],
      direction: 'INBOUND',
      channel: 'SMS',
      content: 'Yes, let\'s go ahead with the repair. When can you come out?',
      status: 'RECEIVED',
      campaignId: null,
      createdAt: daysAgo(1),
    },
    {
      customerId: customerIds[5],
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: 'Hi Jennifer, your AC is due for seasonal maintenance. Regular service extends equipment life by up to 40%. Book now!',
      status: 'DELIVERED',
      campaignId: campaignIds[2],
      createdAt: daysAgo(3),
    },
    {
      customerId: customerIds[9],
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: 'Hi Karen, thanks for choosing us! If you had a great experience, we\'d love a quick Google review.',
      status: 'DELIVERED',
      campaignId: campaignIds[3],
      createdAt: daysAgo(3),
    },
    {
      customerId: customerIds[9],
      direction: 'INBOUND',
      channel: 'SMS',
      content: 'Just left a review! You guys are the best.',
      status: 'RECEIVED',
      campaignId: null,
      createdAt: daysAgo(2),
    },
    {
      customerId: customerIds[20],
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: 'Hi Steven, it\'s been a while! Your Furnace is 12 years old and due for a checkup. Book today and save 15%!',
      status: 'DELIVERED',
      campaignId: campaignIds[0],
      createdAt: daysAgo(1),
    },
    {
      customerId: customerIds[20],
      direction: 'INBOUND',
      channel: 'SMS',
      content: 'Can you come this week?',
      status: 'RECEIVED',
      campaignId: null,
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[10],
      direction: 'OUTBOUND',
      channel: 'EMAIL',
      content: 'Dear Kenneth, please find attached the detailed estimate for your heat pump replacement. Total: $8,500.',
      status: 'DELIVERED',
      campaignId: null,
      createdAt: daysAgo(4),
    },
    {
      customerId: customerIds[25],
      direction: 'INBOUND',
      channel: 'SMS',
      content: 'My AC just stopped working! Can someone come today?',
      status: 'RECEIVED',
      campaignId: null,
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[25],
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: 'We\'re on it! A technician is available at 2pm today. Does that work for you?',
      status: 'DELIVERED',
      campaignId: null,
      createdAt: daysAgo(0),
    },
    {
      customerId: customerIds[30],
      direction: 'OUTBOUND',
      channel: 'EMAIL',
      content: 'Hi Donald, your maintenance membership has lapsed. Renew now and get priority scheduling + 10% off all repairs.',
      status: 'DELIVERED',
      campaignId: campaignIds[5],
      createdAt: daysAgo(1),
    },
  ];

  for (const message of sampleMessages) {
    await prisma.message.create({ data: message });
  }
  console.log(`     ✅ Created ${sampleMessages.length} messages`);

  // Summary
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('  Summary:');
  console.log(`    • ${customerIds.length} customers`);
  console.log(`    • ${campaignIds.length} campaigns`);
  console.log(`    • ${activityLogs.length} activity logs`);
  console.log(`    • ${sampleMessages.length} messages`);
  console.log(`    • ${defaultSettings.length} settings`);
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
