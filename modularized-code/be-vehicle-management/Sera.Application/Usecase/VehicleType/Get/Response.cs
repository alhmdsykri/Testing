namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleTypeResponse
    {
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public int driverLicenseTypeId { get; set; }
        public string? driverLicenseTypeCode { get; set; }       
        public string? driverLicenseTypeName { get; set; }       
        public string? description { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}