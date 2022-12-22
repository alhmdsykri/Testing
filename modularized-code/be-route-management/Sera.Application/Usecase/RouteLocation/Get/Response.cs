namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteLocationResponse
    {        
        public int routeLocationId { get; set; }
        public int? sequenceNumber { get; set; }
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public int? brancId { get; set; }       
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public decimal? distanceToNextLocation { get; set; }
        public int? timeZone { get; set; }
    }
}