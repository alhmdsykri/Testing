namespace Func.Vehicle.Event.Extension
{
    public static class PersistanceExtension
    {
        public static void ConfigurePersistance(this IServiceCollection services)
        {
            string cmosConnString = Environment.GetEnvironmentVariable(CommonConst.FA_COSMOS_DB_SETTING_NAME, EnvironmentVariableTarget.Process);
            services.AddSingleton(c => new CosmosDB(cmosConnString));
            services.AddScoped<ICosmosContext, CosmosContext>();
        }
    }
}
