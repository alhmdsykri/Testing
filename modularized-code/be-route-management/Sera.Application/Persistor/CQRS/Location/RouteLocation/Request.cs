namespace Sera.Application.Persistor.CQRS
{
    [ExcludeFromCodeCoverage]
    public class CQRSUpdateRouteLocationRequest :
        ServiceBusRequest<CQRSUpdateRouteLocation>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CQRSUpdateRouteLocation
    {
        public int locationId { get; set; }
        public string locationName { get; set; }
        public int? locationTypeId { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }
}