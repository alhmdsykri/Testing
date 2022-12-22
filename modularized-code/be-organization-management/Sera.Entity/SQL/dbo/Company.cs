namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Company", Schema = "dbo")]
    public partial class Company
    {
        public Company()
        {
            childCompany = new HashSet<Company>();
            BusinessUnit = new HashSet<BusinessUnit>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public short companyId { get; set; }
        public string? companyCode { get; set; }
        public string companyName { get; set; }
        public short? parentCompanyId { get; set; }
        public byte structureLevel { get; set; }
        public bool? suspendFlag { get; set; }
        public bool sapIntegrated { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }

        public Company parentCompany { get; set; }
        public ICollection<Company> childCompany { get; set; }

        [InverseProperty("Company")]
        public ICollection<BusinessUnit> BusinessUnit { get; set; }
    }
}