namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Product", Schema = "dbo")]
    public partial class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int productId { get; set; }
        public string? productCode { get; set; }
        public byte productStatus { get; set; }
        public string productName { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public byte productTypeId { get; set; }
        public byte journeyTypeId { get; set; }
        public bool isExpedition { get; set; }
        public string? expeditionId { get; set; }
        public bool isAssignedToVehicle { get; set; }
        public bool isAssignedToDriver { get; set; }
        public byte driverExpensePreTripId { get; set; }
        public byte driverExpensePostTripId { get; set; }
        public bool isReconcilation { get; set; }
        public bool hasProofOfDelivery { get; set; }
        public int status { get; set; }
        public DateTime createdAt { get; set; }
        public int createdBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? deletedAt { get; set; }
        public int version { get; set; }
        public string uniqueKey { get; set; }
    }
}