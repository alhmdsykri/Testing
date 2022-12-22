namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Revenue", Schema = "dbo")]

    public partial class Revenue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int revenueId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal revenue { get; set; }
        public decimal distance { get; set; }
        public decimal totalExpense { get; set; }
        public decimal totalRevenue { get; set; }
        public decimal COGS { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string? transactionId { get; set; }

    [ForeignKey("tripExpenseId")]
        public TripExpense TripExpense { get; set; }
    }
}