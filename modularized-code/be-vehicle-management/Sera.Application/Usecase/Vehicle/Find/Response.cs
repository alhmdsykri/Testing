namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVehicleResponse
    {
        public string licensePlate { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public string source { get; set; }
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public string currentLocationCode { get; set; }
        public string currentLocationName { get; set; }
        public string vehicleStatus { get; set; }
        public int vehicleId { get; set; }
        public DateTime lastUpdate { get; set; }
    }
}
