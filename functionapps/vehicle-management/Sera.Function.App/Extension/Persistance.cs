namespace Sera.Function.App.Extension
{
    public static class PersistanceExtension
    {
        public static void ConfigurePersistance(this IServiceCollection services)
        {
            string msqlConnString = "Server=tcp:fms-core-dev-server.database.windows.net;Initial Catalog=fms-core-vehicle;Persist Security Info=False;User ID=service-vehicle;Password=jW@u*PHM_ve@raaa;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
            string cmosConnString = "mongodb://sera-astrafms-cosmosdb-dev:GIpqRLklpuRkoCIyFgLaX9uc7mzaYKRHLEySVKAqy5Nkz95tigCMTgc9zDyBqJOdidh3OD3hcHU2udFLFne0rg==@sera-astrafms-cosmosdb-dev.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@sera-astrafms-cosmosdb-dev@";
            string firebaseURL = @"https://astrafms-2-default-rtdb.asia-southeast1.firebasedatabase.app/";

            services.AddDbContextPool<DBContext>(o => o.UseSqlServer(msqlConnString));
            services.AddScoped<IDbContext>(p => p.GetService<DBContext>());

            services.AddSingleton(c => new CosmosDB(cmosConnString));
            services.AddScoped<ICosmosContext, CosmosContext>();
            services.AddScoped<IFirebaseContext>(p => new FirebaseContext(firebaseURL));
        }
    }
}
