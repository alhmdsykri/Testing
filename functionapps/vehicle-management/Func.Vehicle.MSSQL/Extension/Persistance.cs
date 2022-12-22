namespace Func.Vehicle.MSSQL.Extension
{
    public static class PersistanceExtension
    {
        public static void ConfigurePersistance(this IServiceCollection services)
        {
            string msqlConnString = Environment.GetEnvironmentVariable(CommonConst.FA_MSSQL_DB_SETTING_NAME, EnvironmentVariableTarget.Process);
            services.AddDbContextPool<DBContext>(o => o.UseSqlServer(msqlConnString));
            services.AddScoped<IDbContext>(p => p.GetService<DBContext>());
        }
    }
}
