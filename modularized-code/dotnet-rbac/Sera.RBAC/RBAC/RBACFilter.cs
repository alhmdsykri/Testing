using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using Sera.Common;
using Sera.Common.Extension;
using Sera.Common.Model.Response;
using System.Collections;
using System.Text;

namespace Sera.RBAC
{
    public class RBACFilter : IAsyncAuthorizationFilter
    {
        private IRBACClient client;
        private IRBACPersistance cache;
        private readonly int appId;
        private readonly string key;
        private readonly string feature;
        private readonly int drbacLevel;

        public RBACFilter(int appId, string key, string feature, int drbacLevel)
        {
            this.appId = appId;
            this.key = key;
            this.feature = feature;
            this.drbacLevel = drbacLevel;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var svc = context.HttpContext.RequestServices;

            client = svc.GetService<IRBACClient>();
            cache = svc.GetService<IRBACPersistance>();

            var transactionId = context.HttpContext?.Request?.Headers?[CommonConst.HEADER_TRANSACTION_ID].FirstOrDefault();
            var userId = context.HttpContext?.Request?.Headers?[CommonConst.HEADER_USER_ID].FirstOrDefault();
            var response = new Response();

            #region RBAC
            //RETRIEVE FROM REDIS CACHE
            PermissionStatus rbacPermission = await cache.GetRBACPermissionAsync($"{key}-{userId}", feature);
            if (rbacPermission == PermissionStatus.INACTIVE)
            {
                response.Fail(transactionId, "Access denied, you've got inactive permission");
                context.Result = new JsonResult(response)
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }

            //IF THERE NO DATA, INVOKE API
            if (rbacPermission == PermissionStatus.NOFOUND)
            {
                response.Fail(transactionId, "Access denied, you've got no permission");
                context.Result = new JsonResult(response)
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };

                //[REVISIT]
                //IResultStatus result = await client.GetPermissionAsync(transactionId, appId, int.Parse(userId), feature);
                //if (!result.IsSuccess)
                //{
                //    response.Fail(transactionId, "Access denied, you've got no permission");
                //    context.Result = new JsonResult(response)
                //    {
                //        StatusCode = StatusCodes.Status403Forbidden
                //    };
                //}
            }
            #endregion

            #region DRBAC

            if ((DRBACLevel)drbacLevel != DRBACLevel.NONE)
            {
                //RETRIEVE FROM REDIS
                DRBACModel drbacPermission = await cache.GetDRBACPermissionAsync(CommonConst.DRBAC_REDIS_KEY, userId);

                //IF THERE NO DATA, INVOKE API
                if (drbacPermission == null)
                {
                    var apiResponse = await client.GetDRBACAsync(transactionId, int.Parse(userId));

                    if (response.Status == ResponseStatus.SUCCESS)
                    {
                        drbacPermission = apiResponse.Data;
                    }
                }

                var ctx = context.HttpContext?.Items;
                ctx.Add(CommonConst.DRBAC_PERMISSION_CONTEXT_ITEM_KEY, drbacPermission.Serialize());

                if (drbacLevel > 0)
                {
                    ctx.Add(CommonConst.DRBAC_LEVEL_CONTEXT_ITEM_KEY, drbacLevel);
                }

                if ((DRBACLevel)drbacLevel != DRBACLevel.DEFAULT)
                {
                    //VALIDATE HTTP REQUEST PARAMETER WITH DRBAC
                    List<int> ids = new();
                    DRBACLevel level = (DRBACLevel)drbacLevel;
                    string method = context.HttpContext.Request.Method;

                    switch (method)
                    {
                        case CommonConst.GET:
                            ids.Add(RetrieveIdFromParameter(context, level));
                            break;
                        case CommonConst.PUT:
                            ids = await RetrieveIdFromBody(context, level);
                            break;
                        case CommonConst.POST:
                            ids = await RetrieveIdFromBody(context, level);
                            break;
                        case CommonConst.DELETE:
                            ids.Add(RetrieveIdFromParameter(context, level));
                            break;
                        default:
                            break;
                    }

                    bool isAuthorized = false;
                    switch (level)
                    {
                        case DRBACLevel.DEFAULT:
                            break;
                        case DRBACLevel.COMPANY:
                            isAuthorized = !ids.Except(drbacPermission.companies).Any();
                            break;
                        case DRBACLevel.BUSINESSUNIT:
                            isAuthorized = !ids.Except(drbacPermission.businessUnits).Any();
                            break;
                        case DRBACLevel.BRANCH:
                            isAuthorized = !ids.Except(drbacPermission.branches).Any();
                            break;
                        case DRBACLevel.LOCATION:
                            isAuthorized = !ids.Except(drbacPermission.locations).Any();
                            break;
                        default:
                            break;
                    }

                    if (!isAuthorized)
                    {
                        response.Fail(transactionId, "Access denied, you've got no data permission");
                        context.Result = new JsonResult(response)
                        {
                            StatusCode = StatusCodes.Status403Forbidden
                        };
                    }
                }
            }
           
            #endregion
        }

        #region PRIVATE FUNCTION
        /// <summary>
        /// Retrieve id value from route or query string
        /// </summary>
        /// <param name="context"></param>
        /// <param name="drbacLevel"></param>
        /// <returns></returns>
        private int RetrieveIdFromParameter(AuthorizationFilterContext context, DRBACLevel level)
        {
            int result = 0;

            switch (level)
            {
                case DRBACLevel.DEFAULT:
                    break;
                case DRBACLevel.COMPANY:
                    if (!string.IsNullOrWhiteSpace(context.RouteData.Values["companyId"].ToString()))
                    {
                        _ = int.TryParse(context.RouteData.Values["companyId"].ToString(), out result);
                        break;
                    }

                    if (!string.IsNullOrWhiteSpace(context.HttpContext.Request.Query["companyId"]))
                    {
                        _ = int.TryParse(context.HttpContext.Request.Query["companyId"], out result);
                    }
                    break;
                case DRBACLevel.BUSINESSUNIT:
                    if (!string.IsNullOrWhiteSpace(context.RouteData.Values["businessUnitId"].ToString()))
                    {
                        _ = int.TryParse(context.RouteData.Values["businessUnitId"].ToString(), out result);
                        break;
                    }

                    if (!string.IsNullOrWhiteSpace(context.HttpContext.Request.Query["businessUnitId"]))
                    {
                        _ = int.TryParse(context.HttpContext.Request.Query["businessUnitId"], out result);
                    }
                    break;
                case DRBACLevel.BRANCH:
                    if (!string.IsNullOrWhiteSpace(context.RouteData.Values["branchId"].ToString()))
                    {
                        _ = int.TryParse(context.RouteData.Values["branchId"].ToString(), out result);
                        break;
                    }

                    if (!string.IsNullOrWhiteSpace(context.HttpContext.Request.Query["branchId"]))
                    {
                        _ = int.TryParse(context.HttpContext.Request.Query["branchId"], out result);
                    }
                    break;
                case DRBACLevel.LOCATION:
                    if (!string.IsNullOrWhiteSpace(context.RouteData.Values["locationId"].ToString()))
                    {
                        _ = int.TryParse(context.RouteData.Values["locationId"].ToString(), out result);
                        break;
                    }

                    if (!string.IsNullOrWhiteSpace(context.HttpContext.Request.Query["locationId"]))
                    {
                        _ = int.TryParse(context.HttpContext.Request.Query["locationId"], out result);
                    }
                    break;
                default:
                    break;
            }

            return result;
        }

        private async Task<List<int>> RetrieveIdFromBody(AuthorizationFilterContext context, DRBACLevel level)
        {
            List<int> result = new();
            object tempResult;

            HttpRequestRewindExtensions.EnableBuffering(context.HttpContext.Request);
            var body = context.HttpContext.Request.Body;

            byte[] buffer = new byte[Convert.ToInt32(context.HttpContext.Request.ContentLength)];

            await context.HttpContext.Request.Body.ReadAsync(buffer);

            string requestBody = Encoding.UTF8.GetString(buffer);
            requestBody = requestBody.RemoveLFCR();

            body.Seek(0, SeekOrigin.Begin);

            context.HttpContext.Request.Body = body;

            Dictionary<string, object> drbac = new();
            if (!string.IsNullOrWhiteSpace(requestBody))
            {
                drbac = requestBody.Deserialize<Dictionary<string, object>>();
            }

            switch (level)
            {
                case DRBACLevel.DEFAULT:
                    break;
                case DRBACLevel.COMPANY:
                    result = GetRecursiveId(drbac, "companyId");
                    break;
                case DRBACLevel.BUSINESSUNIT:
                    result = GetRecursiveId(drbac, "businessUnitId");
                    break;
                case DRBACLevel.BRANCH:
                    result = GetRecursiveId(drbac, "branchId");
                    break;
                case DRBACLevel.LOCATION:
                    result = GetRecursiveId(drbac, "locationId");
                    break;
                default:
                    break;
            }

            return result;
        }

        private List<int> GetRecursiveId(Dictionary<string, object> drbac, string key)
        {
            List<int> result = new();
            int temp;

            foreach (var val in drbac)
            {
                //IF THERE IS NO REQUIRED DRBAC FIELD WITH FIELD NAME = KEY ON REQUEST BODY
                if (!val.Key.IsEqual(key) &&
                    (val.Value is not IEnumerable || val.Value is string)) // STRING IS IMPLEMENTING IENUMERABLE, SOURCE = "DUDE TRUST ME"
                {
                    continue;
                }

                //IF THERE IS FIELD WITH NAME = KEY IN REQUEST BODY
                if (val.Key.IsEqual(key) &&
                    val.Value is not IEnumerable &&
                    int.TryParse(val.Value.ToString(), out temp))
                {
                    result.Add(temp);
                    continue;
                }

                //IF THE REQUEST BODY CONTAINS LIST OF OBJECT
                if (val.Value.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))
                {
                    foreach (var item in ((IEnumerable<object>)val.Value).Cast<object>().ToList())
                    {
                        var dict = item as Dictionary<string, object>;
                        object tempId;

                        if (dict.TryGetValue(key, out tempId) &&
                            int.TryParse(tempId.ToString(), out temp))
                        {
                            result.Add(temp);
                            continue;
                        }

                        var tempList = GetRecursiveId(dict, key);
                        if (!tempList.IsEmpty())
                        {
                            result.AddRange(tempList);
                        }
                    }
                }

                //IF THE REQUEST BODY CONTAIN SINGLE NESTED OBJECT
                if (val.Value.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(Dictionary<,>)))
                {
                    result.AddRange(GetRecursiveId((Dictionary<string, object>)val.Value, key));
                }
            }

            return result.Distinct().ToList();
        }
        #endregion
    }
}
