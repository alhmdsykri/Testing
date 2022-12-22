namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("BusinessUnit", Schema = "dbo")]
    public partial class BusinessUnit
    {
        public BusinessUnit()
        {
            Branch = new HashSet<Branch>();
        }

        public int businessUnitId { get; set; }
        public string? businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public short companyId { get; set; }
        public bool sapIntegrated { get; set; }
        public string uniqueKey { get; set; }
        public int status { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        [ForeignKey("companyId")]
        public Company Company { get; set; }

        [InverseProperty("BusinessUnit")]
        public ICollection<Branch> Branch { get; set; }
    }
}
