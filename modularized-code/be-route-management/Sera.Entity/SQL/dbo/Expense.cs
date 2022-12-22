namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Expense", Schema = "dbo")]
    public partial class Expense
    {
     
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int expenseId { get; set; }
        public string expenseName { get; set; }
        public string expenseUnit { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string transactionId { get; set; }

    }
}