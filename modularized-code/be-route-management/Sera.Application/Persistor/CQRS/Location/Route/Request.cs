namespace Sera.Application.Persistor.CQRS
{
    [ExcludeFromCodeCoverage]
    public class CQRSUpdateRouteRequest :
        ServiceBusRequest<CQRSUpdateRoute>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CQRSUpdateRoute
    {
        public int locationId { get; set; }
        public string locationName { get; set; }
    }
}