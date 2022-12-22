namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("ProductVehicleType", Schema = "dbo")]
    public partial class ProductVehicleType
    {
        public int productVehicleTypeId { get; set; }
        public int productId { get; set; }
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public string uomCode { get; set; }
        public string driverType { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int modifiedBy { get; set; }
        public DateTime modifiedAt { get; set; }
        public int version { get; set; }
        public string? transactionId { get; set; }
    }
}