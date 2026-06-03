import { getRedis } from './lib/redis';

async function testRedis() {
  console.log('Testing Upstash Redis connection...');
  const redis = getRedis();
  
  if (!redis) {
    console.error('Redis client not initialized. Check your ENV vars.');
    process.exit(1);
  }
  
  try {
    await redis.set('test-key', 'connection-successful', { ex: 10 });
    const val = await redis.get('test-key');
    console.log('Result:', val);
    
    if (val === 'connection-successful') {
      console.log('✅ Upstash Redis is working perfectly!');
    } else {
      console.log('❌ Unexpected result from Redis.');
    }
  } catch (error) {
    console.error('❌ Redis connection error:', error);
  }
}

testRedis();
