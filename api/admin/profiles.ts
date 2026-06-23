import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;
  const id = query.id;

  // Verify admin access
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  switch (method) {
    case 'GET':
      if (id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (error) return res.status(404).json({ error: 'Profile not found' });
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }

    case 'POST':
      const { email, password, full_name, role = 'customer' } = body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      });

      if (signUpError) return res.status(400).json({ error: signUpError.message });

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role,
        });

      if (profileError) return res.status(500).json({ error: profileError.message });

      return res.status(201).json({ id: authData.user.id, email, full_name, role });

    case 'PATCH':
      if (!id) return res.status(400).json({ error: 'Profile ID required' });
      const { error: updateError } = await supabase
        .from('profiles')
        .update(body)
        .eq('id', id);
      if (updateError) return res.status(500).json({ error: updateError.message });
      return res.status(200).json({ success: true });

    case 'DELETE':
      if (!id) return res.status(400).json({ error: 'Profile ID required' });
      await supabase.auth.admin.deleteUser(id);
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (deleteError) return res.status(500).json({ error: deleteError.message });
      return res.status(200).json({ success: true });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}