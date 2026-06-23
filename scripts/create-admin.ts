import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  const email = 'michaelmarianodasilva81@gmail.com';
  const password = 'M@1dasilva';
  const fullName = 'Michael Mariano';

  console.log('🔄 Creating admin user...');
  console.log(`Email: ${email}`);

  // Create user in auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'admin',
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️ User already exists, updating profile...');
      
      // Get existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      
      if (existingUser) {
        // Update profile to admin
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: existingUser.id,
            email,
            full_name: fullName,
            role: 'admin',
          });
        
        if (profileError) {
          console.error('❌ Error updating profile:', profileError.message);
        } else {
          console.log('✅ Profile updated to admin!');
        }
      }
    } else {
      console.error('❌ Error creating user:', authError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Auth user created!');
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'admin',
      });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
    } else {
      console.log('✅ Profile created with admin role!');
    }
  }

  console.log('\n🎉 Admin setup complete!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('\n('\n⚠️  IMPORTANT: Change password after first login!');
}

createAdmin().catch(console.error);