namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateRouteLocationRequest :
        ServiceBusRequest<UpdateRouteLocationModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateRouteLocationModel
    {
        public int routeId { get; set; }
        public int routeCode { get; set; }
        public string routeName { get; set; }
        public int departurePoolId { get; set; }
        public string departurePoolCode { get; set; }
        public string departurePoolName { get; set; }
        public int? returnRouteId { get; set; }
        public int? returnRouteCode { get; set; }
        public string returnRouteName { get; set; }
        public DateTime lastUpdate { get; set; }
        public string routeJSON { get; set; }
        public string routeKML { get; set; }
        public int? customerId { get; set; }
        public string customerCode { get; set; }
        public string customerName { get; set; }
        public string contractNumber { get; set; }
        public int completionStatus { get; set; }
        public string arrivalPoolCode { get; set; }
        public string arrivalPoolName { get; set; }
        public int? arrivalPoolId { get; set; }
        public int? businessUnitId { get; set; }
        public int? contractId { get; set; }
        public List<RouteLocationModelForUpdate> routeLocation { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class RouteLocationModelForUpdate
    {
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public int? locationTypeId { get; set; }
        public int branchId { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
        public int? timezone { get; set; }
        public decimal? distanceToNextLocation { get; set; }
        public int? sequenceNumber { get; set; }
    }
}
