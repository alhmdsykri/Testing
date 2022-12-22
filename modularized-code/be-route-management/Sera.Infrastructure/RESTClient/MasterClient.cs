using RestSharp;
using Sera.Application.Interface;
using Sera.Application.Persistor;
using Sera.Application.Usecase;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{

    public class MasterClient : IRESTClient, IDisposable
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

        public async Task<Response<LocationDetailModel>> GetLocationByMultipleIdAsync(string transactionId, int userId, int[] locationId)
        {
            var response = new Response<LocationDetailModel>
            {
                Status = Common.ResponseStatus.FAIL
            };

            var req = new RestRequest("/location/multiplelocationid", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);

            foreach (var item in locationId)
            {
                req.AddQueryParameter("locationId", item);
            }

            response = await restClient.GetAsync<Response<LocationDetailModel>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }

            return response;
        }

        public async Task<Response<GetLocation>> GetLocationByIdAsync(string transactionId, int userId, int locationId)
        {
            var response = new Response<GetLocation>
            {
                Status = Common.ResponseStatus.FAIL
            };

            try
            {
                var req = new RestRequest("/location/{locationId}", Method.Get);
                req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
                req.AddHeader(CommonConst.HEADER_USER_ID, userId);

                req.AddUrlSegment("locationId", locationId);

                response = await restClient.GetAsync<Response<GetLocation>>(req);

                if (response != null &&
                    response.Data != null)
                {
                    response.Status = Common.ResponseStatus.SUCCESS;
                }
            }
            catch (Exception ex)
            {
                response.Status = Common.ResponseStatus.FAIL;
                response.Message = ex.Message;
            }

            return response;
        }
    }
}
