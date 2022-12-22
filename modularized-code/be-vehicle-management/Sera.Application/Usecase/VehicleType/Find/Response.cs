namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVehicleTypeResponse
    {
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public string driverLicenseTypeName { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}