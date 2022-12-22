namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("VehicleType", Schema = "dbo")]
    public partial class VehicleType
    {
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public int driverLicenseTypeId { get; set; }
        public string driverLicenseTypeCode { get; set; }
        public string driverLicenseTypeName { get; set; }
        public string description { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}