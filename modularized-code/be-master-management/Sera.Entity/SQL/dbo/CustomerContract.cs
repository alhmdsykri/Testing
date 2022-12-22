namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("CustomerContract", Schema = "dbo")]
    public partial class CustomerContract
    {
        public CustomerContract()
        {
            InverseparentContract = new HashSet<CustomerContract>();
            Location = new HashSet<Location>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int customerContractId { get; set; }
        public string contractNumber { get; set; }
        public int? parentContractId { get; set; }
        public int? companyId { get; set; }
        public string? companyCode { get; set; }
        public string? companyName { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int customerId { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public int customerContractStatus { get; set; }
        public double? remainingKm { get; set; }
        public double? remainingTonnage { get; set; }
        public double? remainingTrip { get; set; }
        public bool isProject { get; set; }
        public bool isMonthly { get; set; }
        public bool isTMS { get; set; }
        public bool isOvercharge { get; set; }
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

        [ForeignKey("customerId")]
        [InverseProperty("CustomerContract")]
        public Customer customer { get; set; }

        [ForeignKey("parentContractId")]
        [InverseProperty("InverseparentContract")]
        public CustomerContract parentContract { get; set; }

        [InverseProperty("parentContract")]
        public ICollection<CustomerContract> InverseparentContract { get; set; }
        [InverseProperty("customerContract")]
        public ICollection<Location> Location { get; set; }
    }
}