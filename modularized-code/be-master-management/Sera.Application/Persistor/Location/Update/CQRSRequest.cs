namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateLocationCQRSRequest
    {
        public int locationId { get; set; }
        public string locationName { get; set; }
    }
    
    [ExcludeFromCodeCoverage]
    public class UpdateRouteCQRSRequest
    {
        public int locationId { get; set; }
        public string locationName { get; set; }
        public int? locationTypeId { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
    }
    
    [ExcludeFromCodeCoverage]
    public class UpdateVehicleCQRSRequest
    {
        public int locationId { get; set; }
        public string locationName { get; set; }

    }
}
