import { ClientSecretCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export default  class KeyVaultSecrets {

  public static async getSQLCredentials() {
    // Keyvault
    let keyVaultClient: any = {};
    const kvURL: any = process.env.KEY_VAULT_URL || null;
    const tenantId: any = process.env.KEY_VAULT_APP_TENANT_ID || null
    const clientId: any = process.env.KEY_VAULT_APP_CLIENT_ID || null
    const clientSecret: any = process.env.KEY_VAULT_APP_CLIENT_SECRET || null
    if (tenantId && clientId && clientSecret) {
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      keyVaultClient = new SecretClient(kvURL, credential);
       const kvSqlUserName: any = process.env.KEY_VAULT_SQL_USER_KEY || null
       const kvSqlPassword: any = process.env.KEY_VAULT_SQL_PASSWORD_KEY || null
       const [
        username,
        password
      ] = await Promise.all(
        [
          await keyVaultClient.getSecret(kvSqlUserName),
          await keyVaultClient.getSecret(kvSqlPassword)
        ]
      );
      return {
        host: process.env.SQL_SERVER_URL,
        db: process.env.SQL_SERVER_USER_DB,
        username: username?.value,
        password: password?.value
       };
      }
    return null;
  }

  public static async getCosmosCredentials() {
    // Keyvault
    let keyVaultClient: any = {};
    const kvURL: any = process.env.KEY_VAULT_URL || null;
    const tenantId: any = process.env.KEY_VAULT_APP_TENANT_ID || null
    const clientId: any = process.env.KEY_VAULT_APP_CLIENT_ID || null
    const clientSecret: any = process.env.KEY_VAULT_APP_CLIENT_SECRET || null
    if (tenantId && clientId && clientSecret) {
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      keyVaultClient = new SecretClient(kvURL, credential);
      const keyVaultCosmosKey: any = process.env.KEY_VAULT_COSMOS_KEY || null;
      const mongooseServerTimeOutMS: number = Number(process.env.MONGOOSE_SERVER_TIMEOUT_MS) || 5000
      const dataBaseName: any = process.env.MONGOOSE_USER_DB || null
      const connectionString = await keyVaultClient.getSecret(keyVaultCosmosKey);
      return {
        mongooseServerTimeOutMS,
        dataBaseName,
        connectionString: connectionString?.value
      }
    }
    return null;
  }

  public static async getServiceBusCredentials() {
    // Keyvault
    let keyVaultClient: any = {};
    const kvURL: any = process.env.KEY_VAULT_URL || null;
    const tenantId: any = process.env.KEY_VAULT_APP_TENANT_ID || null
    const clientId: any = process.env.KEY_VAULT_APP_CLIENT_ID || null
    const clientSecret: any = process.env.KEY_VAULT_APP_CLIENT_SECRET || null
    if (tenantId && clientId && clientSecret) {
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      keyVaultClient = new SecretClient(kvURL, credential);
      const keyVaultSBKey: any = process.env.KEY_VAULT_SERB_KEY || null;
      const conn: any = await keyVaultClient.getSecret(keyVaultSBKey);
      return {
        sbConnectionString: conn?.value
      }
    }
    return null;
  }

  public static async getRedisCredentials() {
    // Keyvault
    let keyVaultClient: any = {};
    const kvURL: any = process.env.KEY_VAULT_URL || null;
    const tenantId: any = process.env.KEY_VAULT_APP_TENANT_ID || null
    const clientId: any = process.env.KEY_VAULT_APP_CLIENT_ID || null
    const clientSecret: any = process.env.KEY_VAULT_APP_CLIENT_SECRET || null
    if (tenantId && clientId && clientSecret) {
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      keyVaultClient = new SecretClient(kvURL, credential);
      const kvRedisKey: any = process.env.KEY_VAULT_REDIS_KEY || null
      const redisKey: any = await keyVaultClient.getSecret(kvRedisKey);
      return {
        redisHostName: process.env.REDIS_HOST,
        redisKey: redisKey?.value
       };
      }
    return null;
  }

}
