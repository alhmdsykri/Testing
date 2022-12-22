namespace Sera.Application.Persistor
{
    public class LocationDetailModel
    {
        public int departurePoolId { get; set; }
        public string departurePoolCode { get; set; }
        public string departurePoolName { get; set; }
        public int arrivalPoolId { get; set; }
        public string arrivalPoolCode { get; set; }
        public string arrivalPoolName { get; set; }
        public List<RouteWayPoint> routeWayPoint { get; set; }
    }

    public class RouteWayPoint
    {
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public int locationTypeId { get; set; }
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }

}
