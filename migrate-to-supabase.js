const { PrismaClient } = require('@prisma/client');

// This script helps migrate data from local to Supabase
// Instructions:
// 1. First run: node migrate-to-supabase.js export
// 2. Change DATABASE_URL to Supabase URL
// 3. Run: npx prisma db push
// 4. Then run: node migrate-to-supabase.js import

async function exportData() {
  const prisma = new PrismaClient();
  
  try {
    // Export all data
    const users = await prisma.user.findMany();
    const accounts = await prisma.account.findMany();
    const sessions = await prisma.session.findMany();
    const focusBlocks = await prisma.focusBlock.findMany();
    const workSessions = await prisma.workSession.findMany();
    const feedbackLogs = await prisma.feedbackLog.findMany();
    const notifications = await prisma.notification.findMany();
    const onboardingAnswers = await prisma.onboardingQuizResponse.findMany();
    
    const data = {
      users,
      accounts,
      sessions,
      focusBlocks,
      workSessions,
      feedbackLogs,
      notifications,
      onboardingAnswers
    };
    
    const fs = require('fs');
    fs.writeFileSync('database-export.json', JSON.stringify(data, null, 2));
    
    console.log('✅ Data exported to database-export.json');
    console.log(`📊 Exported ${users.length} users, ${workSessions.length} work sessions, ${focusBlocks.length} focus blocks`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function importData() {
  const prisma = new PrismaClient();
  const fs = require('fs');
  
  try {
    if (!fs.existsSync('database-export.json')) {
      console.error('❌ No export file found. Run export first.');
      return;
    }
    
    const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
    
    // Import in order (respecting foreign key constraints)
    console.log('📥 Importing users...');
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    
    console.log('📥 Importing accounts...');
    for (const account of data.accounts) {
      await prisma.account.upsert({
        where: { id: account.id },
        update: account,
        create: account
      });
    }
    
    console.log('📥 Importing sessions...');
    for (const session of data.sessions) {
      await prisma.session.upsert({
        where: { id: session.id },
        update: session,
        create: session
      });
    }
    
    console.log('📥 Importing focus blocks...');
    for (const focusBlock of data.focusBlocks) {
      await prisma.focusBlock.upsert({
        where: { id: focusBlock.id },
        update: focusBlock,
        create: focusBlock
      });
    }
    
    console.log('📥 Importing work sessions...');
    for (const workSession of data.workSessions) {
      await prisma.workSession.upsert({
        where: { id: workSession.id },
        update: workSession,
        create: workSession
      });
    }
    
    console.log('📥 Importing feedback logs...');
    for (const log of data.feedbackLogs) {
      await prisma.feedbackLog.upsert({
        where: { id: log.id },
        update: log,
        create: log
      });
    }
    
    console.log('📥 Importing notifications...');
    for (const notification of data.notifications) {
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification
      });
    }
    
    console.log('📥 Importing onboarding answers...');
    for (const answer of data.onboardingAnswers) {
      await prisma.onboardingQuizResponse.upsert({
        where: { id: answer.id },
        update: answer,
        create: answer
      });
    }
    
    console.log('✅ Data import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const command = process.argv[2];
if (command === 'export') {
  exportData();
} else if (command === 'import') {
  importData();
} else {
  console.log('Usage: node migrate-to-supabase.js [export|import]');
} 