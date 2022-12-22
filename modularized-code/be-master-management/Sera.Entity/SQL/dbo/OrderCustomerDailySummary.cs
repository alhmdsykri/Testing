namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("OrderCustomerDailySummary", Schema = "dbo")]
    public class OrderCustomerDailySummary
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int orderCustomerDailySummaryId { get; set; }
        public int customerId { get; set; }
        public decimal value { get; set; }
        public DateTime dateReference { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int version { get; set; }
        public string uniqueKey { get; set; }

        [ForeignKey("customerId")]
        public Customer customer { get; set; }
    }
}
