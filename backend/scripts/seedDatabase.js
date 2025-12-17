/**
 * Database Seeder
 * Populates MongoDB with fictional events, users, tickets, and orders
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const { ROLES, EVENT_CATEGORIES, EVENT_STATUS, TICKET_STATUS, ORDER_STATUS } = require('../utils/constants');

// Sample data
const sampleUsers = [
  { name: 'John Doe', email: 'john@example.com', password: 'password123', role: ROLES.USER },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: ROLES.USER },
  { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123', role: ROLES.USER },
  { name: 'Alice Williams', email: 'alice@example.com', password: 'password123', role: ROLES.ORGANIZER },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: ROLES.ORGANIZER },
  { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: ROLES.ADMIN },
];

const sampleEvents = [
  {
    name: 'Summer Music Festival 2026',
    description: 'A three-day music festival featuring top artists from around the world.',
    category: EVENT_CATEGORIES.CONCERT,
    venue: 'Central Park',
    date: new Date('2026-07-15'),
    time: '18:00',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Championship Basketball Game',
    description: 'Final championship game between the top two teams.',
    category: EVENT_CATEGORIES.SPORTS,
    venue: 'Madison Square Garden',
    date: new Date('2026-06-20'),
    time: '19:30',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Hamlet - Shakespeare Theater',
    description: 'Classic Shakespeare play performed by the Royal Theater Company.',
    category: EVENT_CATEGORIES.THEATER,
    venue: 'Royal Theater',
    date: new Date('2026-08-10'),
    time: '20:00',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Rock Concert Night',
    description: 'Epic rock concert featuring legendary bands.',
    category: EVENT_CATEGORIES.CONCERT,
    venue: 'Stadium Arena',
    date: new Date('2026-09-05'),
    time: '19:00',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Baseball World Series',
    description: 'The ultimate baseball championship game.',
    category: EVENT_CATEGORIES.SPORTS,
    venue: 'Yankee Stadium',
    date: new Date('2026-10-15'),
    time: '20:00',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Jazz Night Live',
    description: 'Intimate jazz performance with world-renowned musicians.',
    category: EVENT_CATEGORIES.CONCERT,
    venue: 'Blue Note Jazz Club',
    date: new Date('2026-07-25'),
    time: '21:00',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'The Phantom of the Opera',
    description: 'Broadway musical masterpiece.',
    category: EVENT_CATEGORIES.THEATER,
    venue: 'Broadway Theater',
    date: new Date('2026-08-20'),
    time: '19:30',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Soccer Championship Final',
    description: 'International soccer championship final match.',
    category: EVENT_CATEGORIES.SPORTS,
    venue: 'National Stadium',
    date: new Date('2026-09-30'),
    time: '17:00',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Classical Symphony Orchestra',
    description: 'Evening of classical music with the city symphony.',
    category: EVENT_CATEGORIES.CONCERT,
    venue: 'Concert Hall',
    date: new Date('2026-10-05'),
    time: '19:30',
    status: EVENT_STATUS.UPCOMING,
  },
  {
    name: 'Comedy Night Stand-Up',
    description: 'Hilarious stand-up comedy show with top comedians.',
    category: EVENT_CATEGORIES.THEATER,
    venue: 'Comedy Club',
    date: new Date('2026-07-30'),
    time: '20:30',
    status: EVENT_STATUS.UPCOMING,
  },
];

const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const seatNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Ticket.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(user.password, salt);
        return {
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role,
        };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get organizers for events
    const organizers = createdUsers.filter(u => u.role === ROLES.ORGANIZER || u.role === ROLES.ADMIN);
    const regularUsers = createdUsers.filter(u => u.role === ROLES.USER);

    // Create events
    console.log('🎭 Creating events...');
    const eventsWithOrganizers = sampleEvents.map((event, index) => ({
      ...event,
      organizerId: organizers[index % organizers.length]._id,
    }));

    const createdEvents = await Event.insertMany(eventsWithOrganizers);
    console.log(`✅ Created ${createdEvents.length} events`);

    // Create tickets
    console.log('🎫 Creating tickets...');
    const tickets = [];
    
    for (const event of createdEvents) {
      // Create 3-8 tickets per event
      const numTickets = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < numTickets; i++) {
        const section = sections[Math.floor(Math.random() * sections.length)];
        const row = rows[Math.floor(Math.random() * rows.length)];
        const seat = seatNumbers[Math.floor(Math.random() * seatNumbers.length)];
        const price = Math.floor(Math.random() * 200) + 50; // $50-$250
        
        // Random seller (could be organizer or regular user)
        const seller = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        tickets.push({
          eventId: event._id,
          sellerId: seller._id,
          section,
          row,
          seat,
          price,
          status: TICKET_STATUS.AVAILABLE,
          listingDate: new Date(),
        });
      }
    }

    const createdTickets = await Ticket.insertMany(tickets);
    console.log(`✅ Created ${createdTickets.length} tickets`);

    // Create orders (some tickets sold)
    console.log('🛒 Creating orders...');
    const orders = [];
    const ticketsToSell = createdTickets.slice(0, Math.floor(createdTickets.length * 0.3)); // 30% of tickets sold
    
    for (let i = 0; i < ticketsToSell.length; i += 2) {
      // Group tickets in pairs for orders (1-3 tickets per order)
      const ticketsForOrder = ticketsToSell.slice(i, i + Math.min(3, ticketsToSell.length - i));
      const buyer = regularUsers[Math.floor(Math.random() * regularUsers.length)];
      const totalAmount = ticketsForOrder.reduce((sum, ticket) => sum + ticket.price, 0);
      
      orders.push({
        buyerId: buyer._id,
        tickets: ticketsForOrder.map(t => t._id),
        totalAmount,
        status: ORDER_STATUS.COMPLETED,
        orderDate: new Date(),
        paymentMethod: 'credit_card',
      });

      // Update ticket status
      await Ticket.updateMany(
        { _id: { $in: ticketsForOrder.map(t => t._id) } },
        {
          status: TICKET_STATUS.SOLD,
          buyerId: buyer._id,
          purchaseDate: new Date(),
        }
      );
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Events: ${createdEvents.length}`);
    console.log(`   - Tickets: ${createdTickets.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeder
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

