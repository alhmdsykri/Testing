namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateRouteDetailRequest :
        ServiceBusRequest<UpdateRouteDetailModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateRouteDetailModel
    {
        public int routeId { get; set; }
        public int? customerId { get; set; }
        public string? customerName { get; set; }
        public string? contractNumber { get; set; }
        public int? returnRouteId { get; set; }
        public string? returnRouteName { get; set; }
    }
}