namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteVehicleRequest :
        ServiceBusRequest<DeleteVehicleModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class DeleteVehicleModel
    {
        public int vehicleId { get; set; }
    }
}
