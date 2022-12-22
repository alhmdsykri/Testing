using RestSharp;
using Sera.Application.Interface;
using Sera.Common;
using Sera.Common.Model.Response;

namespace Sera.Infrastructure.RESTClient
{
    public class OrganizationClient : IRESTOrganizationClient, IDisposable
    {
        private readonly RestClient restClient;

        public OrganizationClient(string baseUrl)
        {
            this.restClient = new RestClient(baseUrl);
        }

        public void Dispose()
        {
            restClient?.Dispose();
            GC.SuppressFinalize(this);
        }

        public async Task<Response<GetBusinessUnit>> GetBusinessUnitAsync(string transactionId, int userId, int? businessUnitId)
        {
            var response = new Response<GetBusinessUnit>
            {
                Status = Common.ResponseStatus.FAIL
            };
            try
            {
                var req = new RestRequest("/businessunit/{businessUnitId}", Method.Get);
                req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
                req.AddHeader(CommonConst.HEADER_USER_ID, userId);
                req.AddParameter("businessUnitId", businessUnitId, ParameterType.UrlSegment);

                response = await restClient.GetAsync<Response<GetBusinessUnit>>(req);
                if (response != null && response.Data != null)
                {
                    response.Status = Common.ResponseStatus.SUCCESS;
                }
            }
            catch (Exception ex)
            {
                return response;
            }
            return response;
        }

        public async Task<Response<GetBranch>> GetBranchAsync(string transactionId, int userId, int? branchId)
        {
            var response = new Response<GetBranch>
            {
                Status = Common.ResponseStatus.FAIL
            };
            try
            {
                var req = new RestRequest("/branch/{branchId}", Method.Get);
                req.AddHeader(CommonConst.HEADER_TRANSACTION_ID, transactionId);
                req.AddHeader(CommonConst.HEADER_USER_ID, userId);
                req.AddParameter("branchId", branchId, ParameterType.UrlSegment);

                response = await restClient.GetAsync<Response<GetBranch>>(req);
                if (response != null && response.Data != null)
                {
                    response.Status = Common.ResponseStatus.SUCCESS;
                }
            }
            catch (Exception ex)
            {
                return response;
            }
            return response;
        }
    }
}