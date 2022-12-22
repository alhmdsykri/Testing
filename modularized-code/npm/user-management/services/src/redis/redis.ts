import { REDIS } from "../config/CONFIG.json";
// tslint:disable-next-line: no-var-requires
// const asyncRedis = require("async-redis");
import asyncRedis from "async-redis";

export class Redis {

    private port: number;
    private redisHostName: string | null;
    private redisCacheKey: string | null;
    private redisEnvironment: string;

    private client: any;

    constructor(host: string | null, key: string | null) {
        this.port = REDIS.PORT;
        this.redisHostName = host;
        this.redisCacheKey = key;
        this.redisEnvironment = REDIS.ENVIRONMENT;
        if (host) {
            if (this.redisEnvironment === "production") {
                this.client = asyncRedis.createClient(this.port, this.redisHostName,
                    {
                        auth_pass: this.redisCacheKey,
                        tls: { servername: this.redisHostName },
                        retry_strategy: (options: any) => {
                            return 10000;
                        }
                    });
            } else if (this.redisEnvironment === "fake") {
                this.client = null;
            } else {
                this.client = asyncRedis.createClient();
            }
        }
    }

    public getCacheConnection() {
        return this.client;
    }

    public async get(key: any) {
        return this.client.get(key);
    }
    public async mget(keys: string[]) {
        return this.client.mget(keys);
    }

    public async hmget(cacheConnection: any, hashName: string, queryItems: string[]) {
        return cacheConnection.hmget(hashName, queryItems);
    }
    public async hmset(cacheConnection: any, key: string, field: any, value: string) {
        return cacheConnection.hmset(key, field, value);
    }

    public async hkeys(cacheConnection: any, hashName: any) {
        return cacheConnection.hkeys(hashName);
    }
    public async hlen(cacheConnection: any, hashName: any) {
        return cacheConnection.hlen(hashName);
    }
    public async hset(cacheConnection: any, name: any, key: any, value: any) {
        return cacheConnection.hset(name, key, value);
    }
    public async hdel(cacheConnection: any, name: any, key: any) {
        return cacheConnection.hdel(name, key);
    }

    public async del(cacheConnection: any, name: any) {
        return cacheConnection.del(name);
    }

    public async set(key: any, value: any, ttl?: number) {
        if (ttl) {
            return this.client.set(key, value, "EX", ttl);
        } else {
            return this.client.set(key, value);
        }
    }

}

