namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleResponse
    {
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public string licensePlate { get; set; }
        public string vin { get; set; }
        public string vehicleCategoryCode { get; set; }
        public string vehicleCategoryName { get; set; }
        public string vehicleBrandCode { get; set; }
        public string vehicleBrandName { get; set; }
        public string vehicleModelCode { get; set; }
        public string vehicleModelName { get; set; }
        public string vehicleColorCode { get; set; }
        public string vehicleColorName { get; set; }
        public int vehicleYear { get; set; }
        public DateTime validFrom { get; set; }
        public DateTime validTo { get; set; }
        public string ownership { get; set; }
        public string fuelTypeName { get; set; }
        public string transmission { get; set; }
        public bool hasOBD { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public string currentLocationCode { get; set; }
        public string currentLocationName { get; set; }
        public string? customerContractNumber { get; set; }
        public string customerName { get; set; }
        public string vehicleStatus { get; set; }
        public string referenceNumber { get; set; }
        public string source { get; set; }
    }
}