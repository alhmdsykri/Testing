namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Vehicle", Schema = "dbo")]
    public partial class Vehicle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vehicleId { get; set; }
        public int vehicleTypeId { get; set; }
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
        public int fueltypeId { get; set; }
        public int transmission { get; set; }
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
        public int currentLocationId { get; set; }
        public string currentLocationCode { get; set; }
        public string currentLocationName { get; set; }
        public int vehicleStatus { get; set; }
        public string? referenceNumber { get; set; }
        public string source { get; set; }
        public int? customerContractId { get; set; }
        public string? customerContractNumber { get; set; }
        public string? customerName { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime modifiedAt { get; set; }
        public int version { get; set; }
        public string uniqueKey { get; set; }

        [ForeignKey("vehicleTypeId")]
        public VehicleType Vehicletype { get; set; }

        [ForeignKey("fueltypeId")]
        public FuelType Fueltype { get; set; }

        [ForeignKey("vehicleBrandId")]
        public VehicleBrand VehicleBrand { get; set; }

        [ForeignKey("vehicleCategoryId")]
        public VehicleCategory VehicleCategory { get; set; }

        [ForeignKey("vehicleColorId")]
        public VehicleColor VehicleColor { get; set; }

        [ForeignKey("vehicleModelId")]
        public VehicleModel VehicleModel { get; set; }
    }
}