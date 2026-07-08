const { createClient } = require('@supabase/supabase-js');

async function auth() {
  const supabase = createClient(
    'https://ogwqvijwbzzzmswgifvx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3F2aWp3Ynp6em1zd2dpZnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTg0NDgsImV4cCI6MjA5NDkzNDQ0OH0.HwMwxFCTt6fXc97oFxA-jYNMSiVc3XL1W5KglS0N5qc'
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ianne@ewa-dev.com',
    password: 'EwaDev2026!',
  });

  if (error) {
    console.error('Auth error:', error);
    process.exit(1);
  }

  console.log('Access token:', data.session.access_token);
  console.log('Refresh token:', data.session.refresh_token);
}

auth();
