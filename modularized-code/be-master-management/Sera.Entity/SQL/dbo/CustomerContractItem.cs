namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("CustomerContractItem", Schema = "dbo")]
    public partial class CustomerContractItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int customerContractItemId { get; set; }
        public int? customerContractId { get; set; }
        public int materialId { get; set; }
        public string UOMCode { get; set; }
        public int? branchId { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public int lineItemNumber { get; set; }
        public int quantity { get; set; }
        public int numberOfDriver { get; set; }
        public string? helperIncluded { get; set; }
        public string? reportIncluded { get; set; }
        public string? UJPIncluded { get; set; }
        public string? fuel { get; set; }
        public string? channelType { get; set; }
        public string? tollAndParking { get; set; }
        public string? driverOrRider { get; set; }
        public string? crew { get; set; }
        public string? coverageArea { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public bool isDedicated { get; set; }
        public bool isWithDriver { get; set; }
        public bool isActive { get; set; }
        public int status { get; set; }
        public string? uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string? transactionId { get; set; }
        public DateTime? persistedDate { get; set; }
        public DateTime? dataStoreTime { get; set; }
        public DateTime? sapMssqlSinkTime { get; set; }
        public DateTime? createdAtSap { get; set; }
        public DateTime? modifiedAtSap { get; set; }
        public bool? isNational { get; set; }

        [ForeignKey("customerContractId")]
        public CustomerContract CustomerContract { get; set; }

        [ForeignKey("materialId")]
        public Material Material { get; set; }

        [ForeignKey("UOMCode")]
        public UOM UOM { get; set; }
    }
}