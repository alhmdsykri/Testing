namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class FleetXRouteRequest : IRequest<IResultStatus>
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
        public DateTime lastUpdate { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }

    public class RouteWaypoint
    {
        public int[] locationId { get; set; }
        public Decimal[] distanceToNextLocation { get; set; }
        public int[] timezone { get; set; }
    }
}
