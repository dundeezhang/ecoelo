const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log('Connection successful. User count:', userCount);
    
    // Test find user by email
    console.log('Testing find user by email...');
    const user = await prisma.user.findUnique({
      where: { email: 'c32leung@uwaterloo.ca' }
    });
    console.log('User:', user);
    
    // Test updating user ELO
    if (user) {
      console.log('Testing updating user ELO...');
      // Handle empty history or invalid JSON
      let historyArray = [];
      try {
        if (user.history && user.history !== '[]') {
          historyArray = JSON.parse(user.history);
          if (!Array.isArray(historyArray)) {
            historyArray = [];
          }
        }
      } catch (e) {
        console.log('Error parsing history, resetting to empty array:', e);
        historyArray = [];
      }
      
      // Add new entry
      historyArray.push({
        date: new Date().toISOString(),
        score: 10
      });
      
      const updatedUser = await prisma.user.update({
        where: { email: 'c32leung@uwaterloo.ca' },
        data: {
          elo: user.elo + 10,
          history: JSON.stringify(historyArray)
        }
      });
      console.log('Updated user:', updatedUser);
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Error details:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();