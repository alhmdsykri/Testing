using Microsoft.Extensions.Configuration;

namespace Sera.Common
{
    public partial class CommonConst
    {
        #region BASE KEY VAULT CREDENTIALS
        private static string? azure_key_vault_url;
        /// <summary>
        /// Get Azure Key Vault URL from configuration file (appsettings.json)
        /// </summary>
        public static string AZURE_KEY_VAULT_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(azure_key_vault_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        azure_key_vault_url = config["AZURE_KEY_VAULT_URL"];
                    }
                }

                return azure_key_vault_url!;
            }
        }

        private static string? azure_key_vault_tenant_id;
        /// <summary>
        /// Get Azure Key Vault Tenant Identity from configuration file (appsettings.json)
        /// </summary>
        public static string AZURE_KEY_VAULT_TENANT_ID
        {
            get
            {
                if (string.IsNullOrWhiteSpace(azure_key_vault_tenant_id))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        azure_key_vault_tenant_id = config["AZURE_KEY_VAULT_TENANT_ID"];
                    }
                }

                return azure_key_vault_tenant_id!;
            }
        }

        private static string? azure_key_vault_client_id;
        /// <summary>
        /// Get Azure Key Vault Client Identity from configuration file (appsettings.json)
        /// </summary>
        public static string AZURE_KEY_VAULT_CLIENT_ID
        {
            get
            {
                if (string.IsNullOrWhiteSpace(azure_key_vault_client_id))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        azure_key_vault_client_id = config["AZURE_KEY_VAULT_CLIENT_ID"];
                    }
                }

                return azure_key_vault_client_id!;
            }
        }

        private static string? azure_key_vault_client_secret;
        /// <summary>
        /// Get Azure Key Vault Client Secret from configuration file (appsettings.json)
        /// </summary>
        public static string AZURE_KEY_VAULT_CLIENT_SECRET
        {
            get
            {
                if (string.IsNullOrWhiteSpace(azure_key_vault_client_secret))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        azure_key_vault_client_secret = config["AZURE_KEY_VAULT_CLIENT_SECRET"];
                    }
                }

                return azure_key_vault_client_secret!;
            }
        }
        #endregion
    }
}
