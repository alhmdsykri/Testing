using Microsoft.AspNetCore.Mvc;
using Sera.Common;

namespace Sera.RBAC
{
    [AttributeUsage(AttributeTargets.Method)]
    public class RBACAttribute : TypeFilterAttribute
    {
        /// <summary>
        /// Validate the user RBAC permission
        /// </summary>
        /// <param name="appId">The application Id (supplied from Common enumeration)</param>
        /// <param name="key">The Redis cache key (excluding the user id)</param>
        /// <param name="feature">The feature name (supplied from AppCons)</param>
        /// <param name="drbacLevel">Lowest DRBAC hierarchy level</param>
        public RBACAttribute(int appId, string key, string feature, int drbacLevel) : base(typeof(RBACFilter))
        {
            Arguments = new object[] { appId, key, feature, drbacLevel };
        }
    }
}
