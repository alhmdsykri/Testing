using RestSharp;
using Sera.Application.Interface;
using Sera.Application.Usecase;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{
    public class RouteClient : IRESTRouteClient, IDisposable
    {
        private readonly RestClient restClient;
        public RouteClient(string baseUrl)
        {
            this.restClient = new RestClient(CommonConst.ROUTE_URL);
        }
        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }
        public async Task<Response<IEnumerable<RouteDataModel>>> GetRouteAsync(string transactionId, int userId, int? locationId)
        {
            IResultStatus result = new ResultStatus();
            var response = new Response<IEnumerable<RouteDataModel>>
            {
                Status = Common.ResponseStatus.FAIL
            };
            var req = new RestRequest("/route", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);
            req.AddParameter("departurePoolId", locationId, ParameterType.QueryString);

            response = await restClient.GetAsync<Response<IEnumerable<RouteDataModel>>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }
            return response;
        }

        public async Task<Response<IEnumerable<RouteDataModel>>> GetRouteArrivalAsync(string transactionId, int userId, int? locationId)
        {
            IResultStatus result = new ResultStatus();
            var response = new Response<IEnumerable<RouteDataModel>>
            {
                Status = Common.ResponseStatus.FAIL
            };
            var req = new RestRequest("/route", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);
            req.AddParameter("arrivalPoolId", locationId, ParameterType.QueryString);

            response = await restClient.GetAsync<Response<IEnumerable<RouteDataModel>>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }
            return response;
        }

        public async Task<Response<IEnumerable<RouteLocationDataModel>>> GetRoutelocationAsync(string transactionId, int userId, int? locationId)
        {
            IResultStatus result = new ResultStatus();
            var response = new Response<IEnumerable<RouteLocationDataModel>>
            {
                Status = Common.ResponseStatus.FAIL
            };
            var req = new RestRequest("/route/{locationId}/routelocation", Method.Get);
            req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
            req.AddHeader(CommonConst.HEADER_USER_ID, userId);
            req.AddParameter("locationId", locationId, ParameterType.QueryString);

            response = await restClient.GetAsync<Response<IEnumerable<RouteLocationDataModel>>>(req);

            if (response != null && response.Data != null)
            {
                response.Status = Common.ResponseStatus.SUCCESS;
            }
            return response;
        }
    }
}