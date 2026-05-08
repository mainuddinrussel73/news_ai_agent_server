import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'qk7DOzTDY0E0J2bnPe7N8YmDjHmvdSly',
    socket: {
        host: 'redis-12279.c322.us-east-1-2.ec2.cloud.redislabs.com',
        port: 12279
    }
});

client.on('error', err => console.log('Redis Client Error', err));

const connection = await client.connect();

connection.on("connect", () => console.log("✅ connected"));
connection.on("error", err => console.log("❌ error", err));

export { connection };