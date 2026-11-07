const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Billing = require('../models/Billing');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('[Seed] Database connected.');

    // Clear existing collections
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Billing.deleteMany({});

    console.log('[Seed] Previous collections cleared.');

    const defaultPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // 1. Create Tenant (Dental Practice)
    const practice = await Tenant.create({
      practiceName: 'BrightSmile Dental Care',
      phoneNumber: '+15552345678',
      address: {
        street: '450 Lexington Ave, Suite 1400',
        city: 'New York',
        state: 'NY',
        zipCode: '10017'
      },
      timeZone: 'America/New_York',
      status: 'ACTIVE',
      subscription: {
        flatFee: 600,
        perBookingCommission: 20,
        status: 'ACTIVE',
        billingCycleAnchorDay: 1
      },
      aiConfig: {
        autoPilotEnabled: true,
        customPromptInstructions: 'Be welcoming, clinically rigorous, and emphasize gum health preventative hygiene. Offer Tuesday 10am and Thursday 2pm slots.',
        operatingHours: {
          start: '08:00',
          end: '17:00'
        },
        hygienistNames: ['Sarah Jenkins, RDH', 'Michael Vance, RDH', 'Elena Rostova, RDH']
      }
    });

    // 2. Create Users
    const superAdmin = await User.create({
      name: 'Alexander Wright',
      email: 'admin@dentagent.ai',
      passwordHash,
      role: 'SUPER_ADMIN',
      isVerified: true
    });

    const practiceAdmin = await User.create({
      name: 'Dr. Sarah Chen, DDS',
      email: 'dr.chen@brightsmiledental.com',
      passwordHash,
      role: 'PRACTICE_ADMIN',
      isVerified: true,
      practiceId: practice._id
    });

    const staffUser = await User.create({
      name: 'Emily Watson',
      email: 'emily@brightsmiledental.com',
      passwordHash,
      role: 'STAFF_USER',
      isVerified: true,
      practiceId: practice._id
    });

    practice.ownerId = practiceAdmin._id;
    await practice.save();

    console.log('[Seed] Created Super Admin, Practice Admin, and Staff User.');

    // 3. Create Overdue Hygiene Patients
    const patientsData = [
      { firstName: 'Marcus', lastName: 'Vance', phone: '+15559811001', email: 'marcus.v@example.com', monthsAgo: 7, insurance: 'Delta Dental Premier' },
      { firstName: 'Chloe', lastName: 'Simmons', phone: '+15559811002', email: 'chloe.s@example.com', monthsAgo: 9, insurance: 'MetLife Dental PPO' },
      { firstName: 'David', lastName: 'Kowalski', phone: '+15559811003', email: 'david.k@example.com', monthsAgo: 14, insurance: 'Cigna Dental Health' },
      { firstName: 'Sophia', lastName: 'Martinez', phone: '+15559811004', email: 'sophia.m@example.com', monthsAgo: 6, insurance: 'Guardian Dental' },
      { firstName: 'Robert', lastName: 'Taylor', phone: '+15559811005', email: 'robert.t@example.com', monthsAgo: 11, insurance: 'Aetna Dental DMO' },
      { firstName: 'Jessica', lastName: 'Alvarez', phone: '+15559811006', email: 'jessica.a@example.com', monthsAgo: 8, insurance: 'Delta Dental PPO' },
      { firstName: 'Daniel', lastName: 'Park', phone: '+15559811007', email: 'daniel.p@example.com', monthsAgo: 16, insurance: 'Humana Dental' },
      { firstName: 'Rachel', lastName: 'Greenberg', phone: '+15559811008', email: 'rachel.g@example.com', monthsAgo: 7, insurance: 'BlueCross Dental' },
      { firstName: 'Thomas', lastName: 'Holloway', phone: '+15559811009', email: 'thomas.h@example.com', monthsAgo: 10, insurance: 'MetLife Dental PPO' },
      { firstName: 'Amanda', lastName: 'Brooks', phone: '+15559811010', email: 'amanda.b@example.com', monthsAgo: 13, insurance: 'Delta Dental Premier' },
      { firstName: 'Kevin', lastName: 'Nguyen', phone: '+15559811011', email: 'kevin.n@example.com', monthsAgo: 6, insurance: 'UnitedHealthcare' },
      { firstName: 'Hannah', lastName: 'Larson', phone: '+15559811012', email: 'hannah.l@example.com', monthsAgo: 9, insurance: 'Cigna Dental Health' }
    ];

    const createdPatients = [];
    for (const p of patientsData) {
      const lastHygieneDate = new Date();
      lastHygieneDate.setMonth(lastHygieneDate.getMonth() - p.monthsAgo);

      const patient = await Patient.create({
        practiceId: practice._id,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        email: p.email,
        lastHygieneDate,
        overdueMonths: p.monthsAgo,
        status: p.monthsAgo > 10 ? 'OVERDUE' : (p.monthsAgo > 7 ? 'ENGAGED' : 'OVERDUE'),
        insuranceCarrier: p.insurance,
        notes: `Recall priority tier ${p.monthsAgo >= 12 ? 'CRITICAL' : 'STANDARD'}`
      });
      createdPatients.push(patient);
    }

    console.log(`[Seed] Seeded ${createdPatients.length} overdue dental patients.`);

    // 4. Create Active Conversations and Message Timelines
    // Patient 0: Marcus Vance (Confirmed booking)
    const conv1 = await Conversation.create({
      practiceId: practice._id,
      patientId: createdPatients[0]._id,
      status: 'BOOKED',
      autoPilot: true,
      lastMessagePreview: 'Perfect! Tuesday at 10:00 AM is reserved with Sarah, RDH.',
      lastMessageAt: new Date(Date.now() - 2 * 3600 * 1000)
    });

    await Message.create([
      {
        conversationId: conv1._id,
        practiceId: practice._id,
        patientId: createdPatients[0]._id,
        sender: 'AI_AGENT',
        body: `Hi Marcus, this is BrightSmile Dental Care. Dr. Chen noticed you are 7 months overdue for your preventative hygiene cleaning. We have slots this Tuesday at 10am or Thursday at 2pm. Would either time work?`,
        sentAt: new Date(Date.now() - 5 * 3600 * 1000),
        deliveryStatus: 'DELIVERED'
      },
      {
        conversationId: conv1._id,
        practiceId: practice._id,
        patientId: createdPatients[0]._id,
        sender: 'PATIENT',
        body: `Hi! Yes, Tuesday at 10am works great for me. Does Delta Dental cover the cleaning?`,
        sentAt: new Date(Date.now() - 3 * 3600 * 1000),
        deliveryStatus: 'RECEIVED'
      },
      {
        conversationId: conv1._id,
        practiceId: practice._id,
        patientId: createdPatients[0]._id,
        sender: 'AI_AGENT',
        body: `Perfect! Tuesday at 10:00 AM is reserved with Sarah, RDH at BrightSmile Dental. Yes, Delta Dental typically covers preventative cleanings at 100%. We look forward to seeing you!`,
        sentAt: new Date(Date.now() - 2 * 3600 * 1000),
        deliveryStatus: 'SENT',
        aiMetadata: { intent: 'BOOKING_CONFIRMED', confidence: 0.99 }
      }
    ]);

    createdPatients[0].status = 'SCHEDULED';
    await createdPatients[0].save();

    // Patient 1: Chloe Simmons (Active conversation)
    const conv2 = await Conversation.create({
      practiceId: practice._id,
      patientId: createdPatients[1]._id,
      status: 'ACTIVE',
      autoPilot: true,
      lastMessagePreview: 'Hi, can I book Friday morning instead?',
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000)
    });

    await Message.create([
      {
        conversationId: conv2._id,
        practiceId: practice._id,
        patientId: createdPatients[1]._id,
        sender: 'AI_AGENT',
        body: `Hi Chloe, this is BrightSmile Dental Care. It has been 9 months since your last cleaning with Michael. Routine cleanings keep tartar and gum pockets under control. Can we get you scheduled for next Tuesday or Thursday?`,
        sentAt: new Date(Date.now() - 4 * 3600 * 1000),
        deliveryStatus: 'DELIVERED'
      },
      {
        conversationId: conv2._id,
        practiceId: practice._id,
        patientId: createdPatients[1]._id,
        sender: 'PATIENT',
        body: `Hi, can I book Friday morning instead?`,
        sentAt: new Date(Date.now() - 30 * 60 * 1000),
        deliveryStatus: 'RECEIVED'
      }
    ]);

    // 5. Seed Confirmed Appointments (Chair Bookings)
    const apt1Date = new Date();
    apt1Date.setDate(apt1Date.getDate() + 2);
    apt1Date.setHours(10, 0, 0, 0);

    const apt2Date = new Date();
    apt2Date.setDate(apt2Date.getDate() + 3);
    apt2Date.setHours(14, 0, 0, 0);

    const apt3Date = new Date();
    apt3Date.setDate(apt3Date.getDate() + 5);
    apt3Date.setHours(11, 30, 0, 0);

    const appt1 = await Appointment.create({
      practiceId: practice._id,
      patientId: createdPatients[0]._id,
      hygienistName: 'Sarah Jenkins, RDH',
      appointmentDate: apt1Date,
      durationMinutes: 60,
      status: 'CONFIRMED',
      bookingChannel: 'SMS_AI_AUTOMATED',
      commissionBilled: false,
      commissionAmount: 20,
      notes: 'Automated 2-way SMS re-activation booking'
    });

    const appt2 = await Appointment.create({
      practiceId: practice._id,
      patientId: createdPatients[3]._id,
      hygienistName: 'Michael Vance, RDH',
      appointmentDate: apt2Date,
      durationMinutes: 60,
      status: 'CONFIRMED',
      bookingChannel: 'SMS_AI_AUTOMATED',
      commissionBilled: false,
      commissionAmount: 20,
      notes: 'Automated 2-way SMS re-activation booking'
    });

    const appt3 = await Appointment.create({
      practiceId: practice._id,
      patientId: createdPatients[5]._id,
      hygienistName: 'Elena Rostova, RDH',
      appointmentDate: apt3Date,
      durationMinutes: 60,
      status: 'CONFIRMED',
      bookingChannel: 'SMS_AI_AUTOMATED',
      commissionBilled: false,
      commissionAmount: 20,
      notes: 'Automated 2-way SMS re-activation booking'
    });

    createdPatients[3].status = 'SCHEDULED';
    await createdPatients[3].save();
    createdPatients[5].status = 'SCHEDULED';
    await createdPatients[5].save();

    console.log('[Seed] Created confirmed hygiene appointments.');

    // 6. Seed Billing Records ($600 Flat Fee + $20/chair)
    const prevMonthBilling = await Billing.create({
      practiceId: practice._id,
      invoiceNumber: 'INV-202610-BSDC',
      month: 10,
      year: 2026,
      baseFee: 600,
      confirmedBookingsCount: 22,
      commissionPerBooking: 20,
      commissionTotal: 440,
      totalAmount: 1040,
      status: 'PAID',
      dueDate: new Date(2026, 9, 15),
      paidAt: new Date(2026, 9, 14),
      paymentMethod: 'ACH Auto-Debit (Chase Business Checking ****4912)',
      lineItems: [
        {
          description: 'DentAgent AI Platform Flat Monthly Retainer & Re-Activation Infrastructure',
          quantity: 1,
          unitPrice: 600,
          amount: 600
        },
        {
          description: 'Confirmed Hygiene Chair Bookings Commission ($20/confirmed chair)',
          quantity: 22,
          unitPrice: 20,
          amount: 440
        }
      ]
    });

    console.log('[Seed] Seeded historical billing invoice.');
    console.log('---------------------------------------------------------');
    console.log('✅ Seed Complete! Credentials:');
    console.log('Super Admin: admin@dentagent.ai / Password123!');
    console.log('Practice Admin: dr.chen@brightsmiledental.com / Password123!');
    console.log('Staff User: emily@brightsmiledental.com / Password123!');
    console.log('Practice: BrightSmile Dental Care');
    console.log('---------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
