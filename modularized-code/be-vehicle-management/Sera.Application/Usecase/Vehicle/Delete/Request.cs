namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteVehicleRequest : IRequest<Response>
    {
        public int vehicleId { get; set; }
    }
}