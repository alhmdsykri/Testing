namespace Func.Vehicle.Firebase.Extension
{
    public static class PersistanceExtension
    {
        public static void ConfigurePersistance(this IServiceCollection services)
        {
            string firebaseURL = Environment.GetEnvironmentVariable(CommonConst.FA_FIREBASE_SETTING_NAME, EnvironmentVariableTarget.Process);
            services.AddScoped<IFirebaseContext>(p => new FirebaseContext(firebaseURL));
        }
    }
}
