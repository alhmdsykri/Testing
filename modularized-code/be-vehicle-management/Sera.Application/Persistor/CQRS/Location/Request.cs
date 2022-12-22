namespace Sera.Application.Persistor.CQRS.Location
{
    [ExcludeFromCodeCoverage]
    public class CQRSUpdateVehicleRequest :
        ServiceBusRequest<CQRSUpdateVehicle>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CQRSUpdateVehicle
    {
        public int locationId { get; set; }
        public string locationName { get; set; }
    }

}
