const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.CLIENT_URL, process.env.CLIENT_SERVICE_ROLE_KEY);

async function inspectTables() {
  const tables = [];
  const { data: tgs, error: errTg } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
  if (!errTg) tables.push(...tgs.map(r => r.tablename));

  const { data: views, error: errViews } = await supabase.from('pg_views').select('viewname').eq('schemaname', 'public');
  if (!errViews) tables.push(...views.map(r => r.viewname));

  console.log('Tables/views found:', tables.length);
  console.log(JSON.stringify(tables, null, 2));
}

inspectTables().catch(console.error);
