﻿using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Sera.Common;
using Sera.Common.Interface.KeyVault;

namespace Sera.Infrastructure.KeyVault
{
    public class AzureKeyVault : IKeyVault
    {
        public async Task<string> GetSecretAsync(string secretName)
        {
            var credential = new ClientSecretCredential(CommonConst.AZURE_KEY_VAULT_TENANT_ID,
                                                        CommonConst.AZURE_KEY_VAULT_CLIENT_ID,
                                                        CommonConst.AZURE_KEY_VAULT_CLIENT_SECRET);
            var client = new SecretClient(new Uri(CommonConst.AZURE_KEY_VAULT_URL), credential);
            KeyVaultSecret secret = await client.GetSecretAsync(secretName);

            return secret.Value;
        }

        public string GetSecret(string secretName)
        {
            var credential = new ClientSecretCredential(CommonConst.AZURE_KEY_VAULT_TENANT_ID,
                                                        CommonConst.AZURE_KEY_VAULT_CLIENT_ID,
                                                        CommonConst.AZURE_KEY_VAULT_CLIENT_SECRET);
            var client = new SecretClient(new Uri(CommonConst.AZURE_KEY_VAULT_URL), credential);
            KeyVaultSecret secret = client.GetSecret(secretName);

            return secret.Value;
        }
    }
}
