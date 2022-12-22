namespace Func.Vehicle.DLQ.Extension
{
    public static class InfrastructureExtension
    {
        public static void ConfigureInfrastructure(this IServiceCollection services)
        {
            string sbusConnString = Environment.GetEnvironmentVariable(CommonConst.FA_SERVICE_BUS_SETTING_NAME, EnvironmentVariableTarget.Process);
            services.AddTransient<IMessage>(m => new AzureServiceBus(sbusConnString));
        }
    }
}