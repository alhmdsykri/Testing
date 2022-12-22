using Microsoft.Extensions.Configuration;

namespace Sera.Common
{
    public partial class CommonConst
    {
        private static string? app_insight_instrumentation_key;
        /// <summary>
        /// Get Azure Application Insight instrumentation key from configuration file (appsettings.json)
        /// </summary>
        private static string APP_INSIGHT_INSTRUMENTATION_KEY
        {
            get
            {
                if (string.IsNullOrWhiteSpace(app_insight_instrumentation_key))
                {
                    string path = BaseConfiguration.GetSection("AppConfigs").GetSection("SourcePath").Value;
                    string name = BaseConfiguration.GetSection("AppConfigs").GetSection("SourceName").Value;
                    string appConfPath = Path.Combine(Directory.GetCurrentDirectory(), path);

                    IConfiguration config;
                    IConfigurationBuilder builder = new ConfigurationBuilder().SetBasePath(appConfPath).AddJsonFile(name);

                    config = builder.Build();

                    if (config != null)
                    {
                        app_insight_instrumentation_key = config["APP_INSIGHT_INSTRUMENTATION_KEY"];
                    }
                }

                return app_insight_instrumentation_key!;
            }
        }
    }
}
