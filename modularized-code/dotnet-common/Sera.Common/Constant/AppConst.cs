using Microsoft.Extensions.Configuration;
using Sera.Common.Interface.KeyVault;

namespace Sera.Common
{
    /// <summary>
    /// All the common constant for whole .NET code
    /// </summary>
    [ExcludeFromCodeCoverage]
    public partial class CommonConst
    {
        public CommonConst()
        { }

        private readonly IKeyVault vault;
        public CommonConst(IKeyVault vault)
        {
            this.vault = vault;
        }

        #region CONSTANTS
        public const string APP_ENVIRONMENT = "DEV";
        public const string BASE_RBAC_KEY = "user-rbac-permissions";
        public const string CONTENT_TYPE_APP_JSON = "application/json";
        public const string DBX_CQRS_USERNAME = "DBX_DELTA";
        public const string DEFAULT_CONTRACT_STATUS = "1,2,3,4"; // 1 = NOT STARTED, 2 = STARTED,3 = EXPIRING SOON,4 = EXPIRED
        public const string DEFAULT_HELPER_INCLUDED = "02";
        public static readonly DateTime DEFAULT_MIN_DATE = DateTime.Parse("1900-01-01");
        public const string DEFAULT_REPORT_INCLUDED = "02";
        public const string DEFAULT_UJP_INCLUDED = "02";
        public const string DRBAC_PERMISSION_CONTEXT_ITEM_KEY = "DRBAC";
        public const string DRBAC_LEVEL_CONTEXT_ITEM_KEY = "DRBAC_LOW";
        public const string DRBAC_REDIS_KEY = "userDataRbac";
        public const string HEADER_TRANSACTION_ID = "transactionId";
        public const string HEADER_USER_ID = "userId";
        public const int MIN_PAGE = 1;
        public const int MIN_ROW = 10;
        public const string REGEX_NAME = "^[0-9a-zA-Z ][0-9a-zA-Z|\\.|\\,|\\s|\\-|\\(|\\)]+$";
        public const string REGEX_CODE = "^[0-9a-zA-Z ]+$"; //Numbers and letters only
        public const string REGEX_NUMBER = "^[0-9]+$"; //Numbers only
        public const string REGEX_EMAIL = "^([\\w-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([\\w-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$"; //email format
        public const int MAX_EXP = 30;
        public const string CUSTOMER_CONTRACT_CRON = "0 * * * * *";
        public const string VENDOR_CONTRACT_CRON = "0 * * * * *";
        #endregion

        #region HTTP METHOD CONSTANT VERSION
        public const string POST = "POST";
        public const string GET = "GET";
        public const string PUT = "PUT";
        public const string DELETE = "DELETE";
        #endregion

        #region COSMOS DB CONSTANT
        public const string COSMOS_EVENT_COLLECTION_NAME = "EventHistory";
        #endregion

        #region FUNCTION APP CONFIGURATION NAME
        /// <summary>
        /// Azure Function application configuration name for retrieving Azure Cosmos DB connection string
        /// </summary>
        public const string FA_COSMOS_DB_SETTING_NAME = "ASTRA_FMS_COSMOS_DB_CONNECTION";
        /// <summary>
        /// Azure Function application configuration name for retrieving Firebase URL
        /// </summary>
        public const string FA_FIREBASE_SETTING_NAME = "ASTRA_FMS_FIREBASE_URL";
        /// <summary>
        /// Azure Function application configuration name for retrieving Azure SQL Server connection string
        /// </summary>
        public const string FA_MSSQL_DB_SETTING_NAME = "ASTRA_FMS_MSSQL_CONNECTION";
        /// <summary>
        /// Azure Function application configuration name for retrieving Azure Service Bus connection string
        /// </summary>
        public const string FA_SERVICE_BUS_SETTING_NAME = "ASTRA_FMS_SERVICE_BUS_CONNECTION";
        public const string GAP_TRESHOLD = "GAP_TRESHOLD_FOR_DLQ";
        #endregion

        #region SERVICE BUS CONSTANTS
        public const string SERVICE_BUS_SQL_FILTER = "Label";
        public const string SERVICE_BUS_EVENT_SUBS_FILTER_NAME = "event-persistor";
        public const string SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME = "firebase-persistor";
        public const string SERVICE_BUS_MSSQL_SUBS_FILTER_NAME = "mssql-persistor";
        public const string SERVICE_BUS_MSSQL_SUBS_CQRS_ROUTE_FILTER_NAME = "master-location-route-dlq";

        public const string CQRS_SERVICE_BUS_TOPIC_NAME = "sbt-cqrs";
        #endregion

        #region AZURE KEY VAULT CONSTANTS
        public const string ORGANIZATION_DB_SECRET = "sera-fms-organization-db-dev";
        public const string MASTER_DB_SECRET = "sera-fms-master-db-dev";
        public const string VEHICLE_DB_SECRET = "sera-fms-vehicle-db-dev";
        public const string ROUTE_DB_SECRET = "sera-fms-route-db-dev";

        public const string SERVICE_BUS_SECRET = "sera-fms-service-bus-dev";
        public const string REDIS_CACHE_SECRET = "sera-fms-redis-cache-dev";
        public const string COSMOS_DB_SECRET = "sera-fms-cosmos-db-dev";
        public const string FIREBASE_SECRET = "sera-fms-firebase-url-dev";
        #endregion

        #region GET CONFIGURATION
        private static IConfiguration baseconfig;
        /// <summary>
        /// Get Application Settings Configuration File
        /// Please add appsettings.json to your client project (REST API, console, Web)
        /// </summary>
        public static IConfiguration BaseConfiguration
        {
            get
            {
                if (baseconfig == null)
                {
                    IConfigurationBuilder configBuilder = new ConfigurationBuilder().
                                                              SetBasePath(Directory.GetCurrentDirectory()).
                                                              AddJsonFile("appsettings.json");
                    baseconfig = configBuilder.Build();
                }

                return baseconfig;
            }
        }
        #endregion

        #region Organization URL
        private static string? organization_url;
        public static string ORGANIZATION_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(organization_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        organization_url = config["ORGANIZATION_URL"];
                    }
                }
                return organization_url!;
            }
        }
        #endregion

        #region Master URL
        private static string? master_url;
        public static string MASTER_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(master_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        master_url = config["MASTER_URL"];
                    }
                }
                return master_url!;
            }
        }
        #endregion

        #region Route URL
        private static string? route_url;
        public static string ROUTE_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(route_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        route_url = config["ROUTE_URL"];
                    }
                }
                return route_url!;
            }
        }
        #endregion

        #region Vehicle URL
        private static string? vehicle_url;
        public static string VEHICLE_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(vehicle_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        vehicle_url = config["VEHICLE_URL"];
                    }
                }
                return vehicle_url!;
            }
        }
        #endregion

        #region Driver URL
        private static string? driver_url;
        public static string DRIVER_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(driver_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        driver_url = config["DRIVER_URL"];
                    }
                }
                return driver_url!;
            }
        }
        #endregion

        #region User URL
        private static string? user_url;
        public static string USER_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(user_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        user_url = config["USER_URL"];
                    }
                }
                return user_url!;
            }
        }
        #endregion

        #region RBAC AND DRBAC
        private static string? rbac_url;
        public static string RBAC_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(rbac_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        rbac_url = config["RBAC_URL"];
                    }
                }

                return rbac_url!;
            }
        }

        private static string? drbac_url;
        public static string DRBAC_URL
        {
            get
            {
                if (string.IsNullOrWhiteSpace(drbac_url))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        drbac_url = config["DRBAC_URL"];
                    }
                }

                return drbac_url!;
            }
        }
        #endregion
    }
}
