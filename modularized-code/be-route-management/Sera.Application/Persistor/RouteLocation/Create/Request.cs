namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateRouteLocationRequest :
        ServiceBusRequest<CreateRouteLocationModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateRouteLocationModel : FleetXRouteRequest
    {
        public int routeId { get; set; }
        public List<RouteLocationModel> routeLocation { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class RouteLocationModel
    {
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public int? locationTypeId { get; set; }
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
        public decimal? distanceToNextLocation { get; set; }
        public int? timezone { get; set; }
        public int? sequenceNumber { get; set; }
    }
}
