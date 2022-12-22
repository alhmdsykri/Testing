using RestSharp;
using Sera.Application.Interface;
using Sera.Application.Usecase;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{
    public class DriverClient : IRESTDriverClient, IDisposable
    {
        private readonly RestClient restClient;

        public DriverClient(string baseUrl)
        {
            this.restClient = new RestClient(CommonConst.DRIVER_URL);
        }

        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }

        public async Task<Response<DriverUserDataModel>> GetDriverlocationAsync(string transactionId, int userId, int? locationId)
        {
            var response = new Response<DriverUserDataModel>
            {
                Status = Common.ResponseStatus.FAIL
            };

            var req = new RestRequest("/validation/{locationId}", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);
            req.AddParameter("locationId", locationId, ParameterType.UrlSegment);

            response = await restClient.GetAsync<Response<DriverUserDataModel>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }
            return response;
        }
    }
}
