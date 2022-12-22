namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleTypeRequest : IRequest<Response<GetVehicleTypeResponse>>
    {
        public int vehicleTypeId { get; set; }
    }
}