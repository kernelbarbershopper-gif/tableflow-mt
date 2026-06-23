import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: any, res: any) {
  const { method, query } = req;
  const id = query.id;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Users can only access their own profile unless admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  if (!isAdmin && user.id !== id) {
    return res.status(403).json({ error: 'Forbidden: Can only access own profile' });
  }

  switch (method) {
    case 'GET':
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(404).json({ error: 'Profile not found' });
      return res.status(200).json(data);

    case 'PATCH':
      const { error: updateError } = await supabase
        .from('profiles')
        .update(req.body)
        .eq('id', id);
      if (updateError) return res.status(500).json({ error: updateError.message });
      const { data: updated } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      return res.status(200).json(updated);

    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}