using RestSharp;
using Sera.Application.Interface;
using Sera.Application.Usecase;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{
    public class MasterClient : IRESTMasterClient, IDisposable
    {
        private readonly RestClient restClient;

        public MasterClient(string baseUrl)
        {
            this.restClient = new RestClient(baseUrl);
        }

        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }

        public async Task<Response<GetValidLocationResponse>> GetLocationUsedAsync(string transactionId, int userId, int? locationId)
        {
            var response = new Response<GetValidLocationResponse>
            {
                Status = Common.ResponseStatus.FAIL
            };

            var req = new RestRequest("/location/{locationId}/used", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);
            req.AddParameter("locationId", locationId, ParameterType.UrlSegment);

            response = await restClient.GetAsync<Response<GetValidLocationResponse>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }
            return response;
        }
    }
}
