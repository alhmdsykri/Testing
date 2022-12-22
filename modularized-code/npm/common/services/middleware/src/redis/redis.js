"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = void 0;
const CONFIG_json_1 = require("../config/CONFIG.json");
const async_redis_1 = __importDefault(require("async-redis"));
class Redis {
    constructor(host, key) {
        this.port = CONFIG_json_1.REDIS.PORT;
        this.redisHostName = host;
        this.redisCacheKey = key;
        this.redisEnvironment = CONFIG_json_1.REDIS.ENVIRONMENT;
        if (host) {
            if (this.redisEnvironment === "production") {
                this.client = async_redis_1.default.createClient(this.port, this.redisHostName, {
                    auth_pass: this.redisCacheKey,
                    tls: { servername: this.redisHostName },
                    retry_strategy: (options) => {
                        return 10000;
                    }
                });
            }
            else if (this.redisEnvironment === "fake") {
                this.client = null;
            }
            else {
                this.client = async_redis_1.default.createClient();
            }
        }
    }
    getCacheConnection() {
        return this.client;
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.get(key);
        });
    }
    mget(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.mget(keys);
        });
    }
    hmget(cacheConnection, hashName, queryItems) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.hmget(hashName, queryItems);
        });
    }
    hmset(cacheConnection, key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.hmset(key, field, value);
        });
    }
    hkeys(cacheConnection, hashName) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.hkeys(hashName);
        });
    }
    hlen(cacheConnection, hashName) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.hlen(hashName);
        });
    }
    hset(cacheConnection, name, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.hset(name, key, value);
        });
    }
    hdel(cacheConnection, name, key) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.hdel(name, key);
        });
    }
    del(cacheConnection, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return cacheConnection.del(name);
        });
    }
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ttl) {
                return this.client.set(key, value, "EX", ttl);
            }
            else {
                return this.client.set(key, value);
            }
        });
    }
}
exports.Redis = Redis;
//# sourceMappingURL=redis.js.map