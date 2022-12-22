using Sera.Application.Usecase;

namespace Sera.Application.Interface
{
    public interface IRESTClient
    {
        Task<Response<LocationDetailModel>> GetLocationByMultipleIdAsync(string transactionId, int userId, int[] locationId);

        Task<Response<GetLocation>> GetLocationByIdAsync(string transactionId, int userId, int locationId);
    }
    public interface IRESTUserClient
    {
        Task<Response<DRBACModel>> GetDRBACAsync(string transactionId, int userId);
    }
}
