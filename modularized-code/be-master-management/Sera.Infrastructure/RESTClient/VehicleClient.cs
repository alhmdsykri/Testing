using RestSharp;
using Sera.Application.Interface;
using Sera.Application.Usecase;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{
    public class VehicleClient : IRESTVehicleClient, IDisposable
    {
        private readonly RestClient restClient;
        public VehicleClient(string baseUrl)
        {
            this.restClient = new RestClient(CommonConst.VEHICLE_URL);
        }
        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }
        public async Task<Response<IEnumerable<VehicleDataModel>>> GetVehicleAsync(string transactionId, int userId, int? locationId)
        {
            var response = new Response<IEnumerable<VehicleDataModel>>
            {
                Status = Common.ResponseStatus.FAIL
            };

            var req = new RestRequest("/vehicle", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);
            req.AddParameter("locationId", locationId, ParameterType.QueryString);

            response = await restClient.GetAsync<Response<IEnumerable<VehicleDataModel>>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }
            return response;
        }
    }
}
