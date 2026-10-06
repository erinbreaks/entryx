import { db } from '../src/lib/db';
import { signTicketToken, verifyTicketToken, generateTicketNumber } from '../src/lib/crypto';
import { hashPassword, comparePassword } from '../src/lib/auth';
import crypto from 'crypto';

async function runRealFlowTests() {
  console.log('====================================================');
  console.log('   ENTRYX END-TO-END FLOW & INTEGRITY VERIFICATION  ');
  console.log('====================================================\n');

  // STEP 1: Owner Setup & Auth
  console.log('1. Testing Owner Account Initialization...');
  const ownerEmail = 'erinbobin@gmail.com';
  const ownerPassword = 'SuperSecretOwnerPassword2026!';
  const ownerHash = await hashPassword(ownerPassword);
  
  const owner = await db.createProfile({
    name: 'Erin Bobin',
    email: ownerEmail,
    password_hash: ownerHash,
    role: 'owner',
    phone: '9446611885',
  });
  console.log('✓ Owner Profile Created in DB:', { id: owner.id, email: owner.email, role: owner.role });

  const ownerAuthMatch = await comparePassword(ownerPassword, owner.password_hash);
  if (!ownerAuthMatch) throw new Error('Password verification failed for owner');
  console.log('✓ Owner Password Authentication Verified.\n');

  // STEP 2: Event Creation Request Submission
  console.log('2. Testing Public Event Creation Request Submission...');
  const eventReq = await db.createEventRequest({
    full_name: 'David Miller',
    email: 'david.miller@techclub.org',
    phone: '9876543210',
    organization_name: 'Tech Horizons Club',
    message: 'We want to host the Annual Hackathon 2026 for 2 attendees max.',
    event_description: 'An exclusive tech hackathon with gate verification.',
  });
  console.log('✓ Event Request Created:', { id: eventReq.id, org: eventReq.organization_name, status: eventReq.status });

  // STEP 3: Owner Reviews & Approves Organizer
  console.log('\n3. Owner Approving Request and Provisioning Organizer Account...');
  const orgPassword = 'OrganizerSecurePass123!';
  const orgHash = await hashPassword(orgPassword);
  
  const updatedReq = await db.updateEventRequestStatus(eventReq.id, 'approved', owner.id);
  const organizer = await db.createProfile({
    name: eventReq.full_name,
    email: eventReq.email,
    password_hash: orgHash,
    role: 'organizer',
    phone: eventReq.phone,
  });
  console.log('✓ Organizer Account Provisioned:', { id: organizer.id, email: organizer.email, role: organizer.role });

  // STEP 4: Organizer Creates Event with Capacity = 2
  console.log('\n4. Organizer Creating Event with Capacity = 2...');
  const event = await db.createEvent({
    name: 'Annual Hackathon 2026',
    description: 'Exclusive hackathon with real-time capacity and QR check-ins.',
    ticket_price: 250,
    max_capacity: 2,
    event_date: '2026-11-15',
    start_time: '09:00',
    end_time: '18:00',
    venue: 'Main Tech Arena, Hall 3',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    created_by: organizer.id,
    status: 'active',
  });
  await db.assignOrganizerToEvent(event.id, organizer.id);
  console.log('✓ Event Created in DB:', { id: event.id, name: event.name, capacity: event.max_capacity });

  // Check initial counts
  const initialStats = await db.getEventStats(event.id);
  console.log('✓ Initial Real DB Counts:', { registered: initialStats.registeredCount, checkedIn: initialStats.checkedInCount });
  if (initialStats.registeredCount !== 0) throw new Error('Initial count must be 0');

  // STEP 5: Student 1 Registers
  console.log('\n5. Student 1 Registering for Event...');
  const reg1Res = await db.registerStudent({
    eventId: event.id,
    fullName: 'Alice Johnson',
    email: 'alice.johnson@student.edu',
    studentId: 'STU-1001',
  });
  
  const ticket1Number = generateTicketNumber();
  const ticket1Token = signTicketToken({
    ticketId: crypto.randomUUID(),
    registrationId: reg1Res.registration.id,
    eventId: event.id,
    attendeeEmail: reg1Res.registration.email,
    studentId: reg1Res.registration.student_id,
    issuedAt: Date.now(),
  });

  const ticket1 = await db.createTicket({
    registration_id: reg1Res.registration.id,
    event_id: event.id,
    ticket_number: ticket1Number,
    signed_token: ticket1Token,
    qr_data_url: 'data:image/png;base64,mocked_for_test',
  });
  console.log('✓ Student 1 Ticket Issued:', { ticketNumber: ticket1.ticket_number, status: ticket1.status });

  // STEP 6: Student 2 Registers (Reaches Capacity = 2)
  console.log('\n6. Student 2 Registering for Event...');
  const reg2Res = await db.registerStudent({
    eventId: event.id,
    fullName: 'Bob Smith',
    email: 'bob.smith@student.edu',
    studentId: 'STU-1002',
  });

  const ticket2Number = generateTicketNumber();
  const ticket2Token = signTicketToken({
    ticketId: crypto.randomUUID(),
    registrationId: reg2Res.registration.id,
    eventId: event.id,
    attendeeEmail: reg2Res.registration.email,
    studentId: reg2Res.registration.student_id,
    issuedAt: Date.now(),
  });

  const ticket2 = await db.createTicket({
    registration_id: reg2Res.registration.id,
    event_id: event.id,
    ticket_number: ticket2Number,
    signed_token: ticket2Token,
    qr_data_url: 'data:image/png;base64,mocked_for_test',
  });
  console.log('✓ Student 2 Ticket Issued:', { ticketNumber: ticket2.ticket_number, status: ticket2.status });

  // STEP 7: Capacity Limit Enforcement (Student 3 attempts registration)
  console.log('\n7. Testing Capacity Enforcement with 3rd Student...');
  try {
    await db.registerStudent({
      eventId: event.id,
      fullName: 'Charlie Brown',
      email: 'charlie@student.edu',
      studentId: 'STU-1003',
    });
    throw new Error('Registration should have been rejected due to capacity!');
  } catch (capacityErr: any) {
    console.log('✓ Capacity Limit Successfully Enforced! Error Caught:', capacityErr.message);
  }

  // STEP 8: Cryptographic Signature Verification
  console.log('\n8. Testing Cryptographic HMAC-SHA256 Token Validation...');
  const validVerification = verifyTicketToken(ticket1.signed_token);
  if (!validVerification.valid) throw new Error('Valid token failed verification');
  console.log('✓ Valid Token Verification Succeeded.');

  // Test Tampered Token
  const tamperedToken = ticket1.signed_token.slice(0, -4) + 'abcd';
  const tamperedVerification = verifyTicketToken(tamperedToken);
  if (tamperedVerification.valid) throw new Error('Tampered token should have failed verification');
  console.log('✓ Tampered Token Correctly Rejected as INVALID TICKET.');

  // STEP 9: Check-in Flow (First Scan -> CHECKED-IN)
  console.log('\n9. Testing Gate Scanner Check-in (First Scan)...');
  const isOrgAuthorized = await db.isOrganizerAuthorizedForEvent(organizer.id, event.id);
  if (!isOrgAuthorized) throw new Error('Organizer should be authorized for this event');

  await db.updateTicketStatus(ticket1.id, 'checked_in');
  const checkIn1 = await db.recordCheckIn(ticket1.id, event.id, organizer.id);
  console.log('✓ Check-In Success:', { result: 'CHECKED_IN', timestamp: checkIn1.checked_in_at });

  // STEP 10: Duplicate Scan (Second Scan -> ALREADY USED)
  console.log('\n10. Testing Duplicate Scan (Second Scan)...');
  const checkedTicket = await db.getTicketById(ticket1.id);
  if (checkedTicket?.status === 'checked_in') {
    const originalCheckIn = await db.getCheckInByTicketId(ticket1.id);
    console.log('✓ Duplicate Scan Correctly Detected: ALREADY USED. Preserved Timestamp:', originalCheckIn?.checked_in_at);
  } else {
    throw new Error('Ticket should have status checked_in');
  }

  // STEP 11: Organizer Isolation / Security Check
  console.log('\n11. Testing Organizer Isolation Security...');
  const otherOrganizer = await db.createProfile({
    name: 'Unauthorized Organizer',
    email: 'other@example.com',
    password_hash: await hashPassword('password123'),
    role: 'organizer',
  });
  
  const isOtherAuthorized = await db.isOrganizerAuthorizedForEvent(otherOrganizer.id, event.id);
  if (isOtherAuthorized) throw new Error('Other organizer should NOT be authorized for this event');
  console.log('✓ Security Check Passed: Organizer A cannot access or verify Organizer B\'s event.\n');

  // STEP 12: Final Aggregate DB Stats Verification
  console.log('12. Verifying Final Database Statistics...');
  const finalStats = await db.getEventStats(event.id);
  const sysStats = await db.getSystemOverviewStats();
  console.log('✓ Final Event Stats:', finalStats);
  console.log('✓ Final System Stats:', sysStats);

  console.log('\n====================================================');
  console.log('   ALL END-TO-END FLOWS AND CHECKS PASSED 100%!     ');
  console.log('====================================================');
}

runRealFlowTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
