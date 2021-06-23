const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
	'https://sbogvmcjtjrgffqnydly.supabase.co',
	process.env.SUPABASE_KEY
);

module.exports = supabase;