namespace Sera.Function.App.Extension
{
    public static class InfrastructureExtension
    {
        public static void ConfigureInfrastructure(this IServiceCollection services)
        {
            string sbusConnString = "Endpoint=sb://sera-fms-servicebus-dev.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=HYvMgPjalKbnLLZvy5PG6N0aVf874hg+W70yr3JK0bM=";
            services.AddTransient<IMessage>(m => new AzureServiceBus(sbusConnString));
        }
    }
}