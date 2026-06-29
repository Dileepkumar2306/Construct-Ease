const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. File uploads will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession:   false,
    },
});

module.exports = supabase;
