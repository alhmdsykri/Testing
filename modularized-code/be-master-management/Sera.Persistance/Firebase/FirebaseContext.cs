using Firebase.Database;
using Firebase.Database.Query;
using Google.Apis.Auth.OAuth2;
using System.Reflection;

namespace Sera.Persistance.Firebase
{
    public class FirebaseContext : IFirebaseContext
    {
        private readonly string url;

        public FirebaseContext(string url)
        {
            this.url = url;
        }

        public async Task CreateAsync(Notification data, int userId)
        {
            using var client = new FirebaseClient(this.url, new FirebaseOptions { AuthTokenAsyncFactory = () => GetAccessToken(), AsAccessToken = true });
            await client.Child(userId.ToString()).PostAsync(data);
        }

        private static async Task<string> GetAccessToken()
        {
            string exe = Assembly.GetExecutingAssembly().Location;
            string path = $"{Path.GetDirectoryName(exe)}/Config/astrafms-2-firebase.json";
            var credential = GoogleCredential.FromFile(path)
                                             .CreateScoped(new string[]
                                             { "https://www.googleapis.com/auth/firebase.database",
                                               "https://www.googleapis.com/auth/userinfo.email" });

            ITokenAccess c = credential;
            return await c.GetAccessTokenForRequestAsync();
        }
    }
}