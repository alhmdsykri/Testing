namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("OrderCustomerMonthlySummary", Schema = "dbo")]
    public class OrderCustomerMonthlySummary
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderCustomerMonthlySummaryId { get; set; }
        public int CustomerId { get; set; }
        public decimal Value { get; set; }
        public DateTime DateReference { get; set; }
        public int BusinessUnitId { get; set; }
        public string BusinessUnitCode { get; set; }
        public string BusinessUnitName { get; set; }
        public int Status { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public int Version { get; set; }
        public string UniqueKey { get; set; }

        [ForeignKey("customerId")]
        public Customer customer { get; set; }
    }
}