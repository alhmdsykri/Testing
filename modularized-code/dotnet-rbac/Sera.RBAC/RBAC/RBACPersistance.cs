using Sera.Common;
using Sera.Common.Extension;
using Sera.Common.Model.Response;
using StackExchange.Redis;

namespace Sera.RBAC
{
    public interface IRBACPersistance
    {
        Task<PermissionStatus> GetRBACPermissionAsync(string key, string feature);
        Task<DRBACModel> GetDRBACPermissionAsync(string key, string userId);
    }

    public class RBACPersistance : IRBACPersistance
    {
        private static ConnectionMultiplexer connection;
        public RBACPersistance(string connString)
        {
            connection = ConnectionMultiplexer.Connect(connString);
        }

        public static ConnectionMultiplexer Connection
        {
            get { return connection; }
        }

        public async Task<PermissionStatus> GetRBACPermissionAsync(string key, string feature)
        {
            PermissionStatus result = PermissionStatus.NOFOUND;

            IDatabase cache = Connection.GetDatabase();
            long rbacLength = await cache.HashLengthAsync(key);

            //CHECK THE CACHE LENGTH
            if (rbacLength <= 0) { return result; }

            var rbacKey = await cache.HashKeysAsync(key);
            if (rbacKey == null || rbacKey.Length <= 0)
            {
                result = PermissionStatus.INACTIVE;
                return result;
            }

            var rbac = await cache.HashGetAsync(key, feature);
            if (rbac.IsNullOrEmpty)
            {
                result = PermissionStatus.INACTIVE;
                return result;
            }

            rbac.TryParse(out int permission);

            result = (PermissionStatus)permission;

            return result;
        }

        public async Task<DRBACModel> GetDRBACPermissionAsync(string key, string userId)
        {
            DRBACModel result = new();

            IDatabase cache = Connection.GetDatabase();
            long drbacLength = await cache.HashLengthAsync(key);

            //CHECK THE CACHE LENGTH
            if (drbacLength <= 0) { return result; }

            var rbacKey = await cache.HashKeysAsync(key);
            if (rbacKey == null || rbacKey.Length <= 0)
            {
                return result;
            }

            var rbac = await cache.HashGetAsync(key, userId);
            if (rbac.IsNullOrEmpty)
            {
                return result;
            }

            var permission = rbac.ToString();
            result = permission.Deserialize<DRBACModel>();

            return result;
        }
    }
}