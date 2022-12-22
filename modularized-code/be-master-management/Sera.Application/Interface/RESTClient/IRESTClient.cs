using Sera.Application.Usecase;

namespace Sera.Application.Interface
{
    public interface IRESTOrganizationClient
    {
        Task<Response<GetBusinessUnit>> GetBusinessUnitAsync(string transactionId, int userId, int? businessUnitId);
        Task<Response<GetBranch>> GetBranchAsync(string transactionId, int userId, int? branchId);
    }
    public interface IRESTVehicleClient
    {
        Task<Response<IEnumerable<VehicleDataModel>>> GetVehicleAsync(string transactionId, int userId, int? locationId);
    }
    public interface IRESTRouteClient
    {
        Task<Response<IEnumerable<RouteDataModel>>> GetRouteAsync(string transactionId, int userId, int? locationId);
        Task<Response<IEnumerable<RouteDataModel>>> GetRouteArrivalAsync(string transactionId, int userId, int? locationId);
        Task<Response<IEnumerable<RouteLocationDataModel>>> GetRoutelocationAsync(string transactionId, int userId, int? locationId);
    }
 
    public interface IRESTUserClient
    {
        Task<Response<DriverUserDataModel>> GetRolePositionlocationAsync(string transactionId, int userId, int? locationId);
        Task<Response<DRBACModel>> GetDRBACAsync(string transactionId, int userId);
    }
    public interface IRESTDriverClient
    {
        Task<Response<DriverUserDataModel>> GetDriverlocationAsync(string transactionId, int userId, int? locationId);
    }

    public interface IRESTMasterClient
    {
        Task<Response<GetValidLocationResponse>> GetLocationUsedAsync(string transactionId, int userId, int? locationId);
    }
}
