#!/usr/bin/env node
/**
 * Integration test runner
 * Runs all integration tests using Node.js built-in test runner
 */
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { pipeline } from 'node:stream/promises';
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('Integration Test Suite');
console.log('======================');
console.log(`PostgreSQL: ${process.env.SERVICE_POSTGRES_HOST || 'postgres'}:${process.env.SERVICE_POSTGRES_PORT || '5432'}`);
console.log(`Redis:      ${process.env.SERVICE_REDIS_HOST || 'redis'}:${process.env.SERVICE_REDIS_PORT || '6379'}`);
console.log('');

// Find all test files
const testDir = __dirname;
const files = await readdir(testDir);
const testFiles = files
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => join(testDir, f));

console.log(`Running ${testFiles.length} test file(s):`);
testFiles.forEach((f) => console.log(`  - ${f.split('/').pop()}`));
console.log('');

// Run the tests
const stream = run({
  files: testFiles,
  concurrency: false,
  timeout: 30000,
});

let hasFailures = false;
stream.on('test:fail', () => {
  hasFailures = true;
});

try {
  await pipeline(stream, new spec(), process.stdout);
} catch (err) {
  // pipeline may throw if there are test failures reported via the stream
  hasFailures = true;
}

process.exit(hasFailures ? 1 : 0);
