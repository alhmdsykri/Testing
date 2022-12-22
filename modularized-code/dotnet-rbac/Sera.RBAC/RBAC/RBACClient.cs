using RestSharp;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.RBAC
{
    public interface IRBACClient
    {
        Task<IResultStatus> GetRBACAsync(string transactionId, int appId,
                                         int userId, string? attributeId = null);
        Task<Response<DRBACModel>> GetDRBACAsync(string transactionId, int userId);
    }

    public class RBACClient : IRBACClient, IDisposable
    {
        private readonly RestClient restClient;

        public RBACClient()
        {
            this.restClient = new RestClient(CommonConst.RBAC_URL);
        }

        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }

        public async Task<IResultStatus> GetRBACAsync(string transactionId, int appId,
                                                      int userId, string? attributeId = null)
        {
            IResultStatus result = new ResultStatus();
            var response = new Response<IEnumerable<RBACModel>>();

            try
            {
                var r = new RestRequest("rbac-role-permissions", Method.Get);
                r.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);

                r.AddQueryParameter("appId", appId);
                r.AddQueryParameter("userId", userId);
                if (!string.IsNullOrWhiteSpace(attributeId))
                {
                    r.AddQueryParameter("attributeId", attributeId);
                }

                response = await restClient.PostAsync<Response<IEnumerable<RBACModel>>>(r);

                if (response == null || !response.Data.Any())
                {
                    return result.ReturnErrorStatus(Message.NotFound("permission"));
                }

                bool isAuthorized = false;

                isAuthorized = response.Data.Any(x => x.attributeId == attributeId);

                if (!isAuthorized)
                {
                    return result.ReturnErrorStatus(Message.Unauthorized());
                }

                return result.ReturnSuccessStatus();
            }
            catch
            {
                return result.ReturnErrorStatus(Message.Exception("get permission"));
            }
        }

        public async Task<Response<DRBACModel>> GetDRBACAsync(string transactionId, int userId)
        {
            var response = new Response<DRBACModel>
            {
                Status = Common.ResponseStatus.FAIL
            };

            var r = new RestRequest("data-rbac", Method.Get);
            r.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            r.AddUrlSegment("userId", userId);

            response = await restClient.GetAsync<Response<DRBACModel>>(r);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }

            return response;
        }
    }
}
