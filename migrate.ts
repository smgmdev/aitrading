import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';

async function migrate() {
  const currentDb = drizzle({
    client: new Pool({ connectionString: process.env.DATABASE_URL })
  }, { schema });

  const supabaseDb = drizzle({
    client: new Pool({ 
      connectionString: 'postgresql://postgres.uhoflkauorczxpefqmrn:Aigul123!@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
    })
  }, { schema });

  try {
    // Migrate positions
    console.log('Exporting positions...');
    const positions = await currentDb.select().from(schema.positions);
    console.log(`Found ${positions.length} positions`);
    
    if (positions.length > 0) {
      await supabaseDb.insert(schema.positions).values(positions as any);
      console.log('✓ Positions migrated');
    }

    // Migrate logs
    console.log('Exporting AI logs...');
    const logs = await currentDb.select().from(schema.aiLogs);
    console.log(`Found ${logs.length} logs`);
    
    if (logs.length > 0) {
      await supabaseDb.insert(schema.aiLogs).values(logs as any);
      console.log('✓ Logs migrated');
    }

    // Migrate config
    console.log('Exporting system config...');
    const configs = await currentDb.select().from(schema.systemConfig);
    console.log(`Found ${configs.length} config records`);
    
    if (configs.length > 0) {
      await supabaseDb.insert(schema.systemConfig).values(configs as any);
      console.log('✓ Config migrated');
    }

    console.log('\n✓ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

migrate();
