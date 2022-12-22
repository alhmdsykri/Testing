namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetLocationByMultipleIdResponse
    {
        public List<RouteWayPoint> routeWayPoint { get; set; }
    }

    public class RouteWayPoint
    {
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public int locationTypeId { get; set; }
        public int? branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }
}