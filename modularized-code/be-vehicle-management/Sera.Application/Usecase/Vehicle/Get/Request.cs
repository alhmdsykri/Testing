namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleRequest : IRequest<Response<GetVehicleResponse>>
    {
        public int vehicleId { get; set; }
    }
}