const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.CLIENT_URL, process.env.CLIENT_SERVICE_ROLE_KEY);

async function listTables() {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}
listTables();
