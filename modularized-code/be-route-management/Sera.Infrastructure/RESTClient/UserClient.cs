using RestSharp;
using Sera.Application.Interface;
using Sera.Application.Persistor;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{

    public class UserClient : IRESTUserClient, IDisposable
    {
        private readonly RestClient restClient;

        public UserClient(string baseUrl)
        {
            this.restClient = new RestClient(baseUrl);
        }

        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }

        public async Task<Response<DRBACModel>> GetDRBACAsync(string transactionId, int userId)
        {
            var response = new Response<DRBACModel>
            {
                Status = Common.ResponseStatus.FAIL
            };

            var req = new RestRequest("/data-rbac/{userId}", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddParameter("userId", userId, ParameterType.UrlSegment);

            response = await restClient.GetAsync<Response<DRBACModel>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }

            return response;
        }
    }
}
