namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewVehicleRequest : IRequest<Response<GetOverviewVehicleResponse>>
    {
        public int vehicleTypeId { get; set; }
    }
}
