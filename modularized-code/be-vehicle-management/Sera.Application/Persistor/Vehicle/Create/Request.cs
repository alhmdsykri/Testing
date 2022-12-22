namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateVehicleRequest :
        ServiceBusRequest<CreateVehicleModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateVehicleModel
    {
        public string vehicleTypeCode { get; set; }
        public string licensePlate { get; set; }
        public string vin { get; set; }
        public int vehicleCategoryId { get; set; }
        public int vehicleBrandId { get; set; }
        public int vehicleModelId { get; set; }
        public int vehicleColorId { get; set; }
        public int vehicleYear { get; set; }
        public DateTime validFrom { get; set; }
        public DateTime validTo { get; set; }
        public string ownership { get; set; }
        public int transmission { get; set; }
        public int fuelTypeId { get; set; }
        public bool hasOBD { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public string referenceNumber { get; set; }
    }
 
}
