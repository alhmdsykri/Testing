namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("VendorContract", Schema = "dbo")]
    public partial class VendorContract
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vendorContractId { get; set; }
        public string vendorContractNumber { get; set; }
        public string vendorContractType { get; set; }
        public int vendorContractStatus { get; set; }
        public int vendorId { get; set; }
        public int? companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
        public int? businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        [ForeignKey("vendorId")]
        public Vendor vendor { get; set; }
    }
}
