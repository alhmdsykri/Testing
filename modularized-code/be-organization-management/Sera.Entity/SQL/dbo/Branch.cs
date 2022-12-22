namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Branch", Schema = "dbo")]
    public partial class Branch
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int branchId { get; set; }
        public string? branchCode { get; set; }
        public string branchName { get; set; }
        public int businessUnitId { get; set; }
        public int regionId { get; set; }
        public bool sapIntegrated { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        [ForeignKey("regionId")]
        [InverseProperty("Branch")]
        public Region Region { get; set; }

        [ForeignKey("businessUnitId")]
        [InverseProperty("Branch")]
        public BusinessUnit BusinessUnit { get; set; }
    }
}
