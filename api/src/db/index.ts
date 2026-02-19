import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../utils/config.js';
import * as schema from './schema/index.js';

// Create postgres connection
const queryClient = postgres(config.databaseUrl);

// Create drizzle instance
export const db = drizzle(queryClient, { schema });
