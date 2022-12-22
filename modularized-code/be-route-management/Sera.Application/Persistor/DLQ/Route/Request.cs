namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class RouteDLQRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public int routeId { get; set; }
        public string routeName { get; set; }
        public string routeJSON { get; set; }
        public string routeKML { get; set; }
        public RouteWaypoint routeWaypoint { get; set; }
        public int businessUnitId { get; set; }
        public string action { get; set; }
        public int userId { get; set; }
        public int departurePoolId { get; set; }
        public string departurePoolName { get; set; }
        public string departurePoolCode { get; set; }
        public string arrivalPoolCode { get; set; }
        public string arrivalPoolName { get; set; }
        public int arrivalPoolId { get; set; }
        public DateTime lastUpdate { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
