namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("ProductExpense", Schema = "dbo")]
    public partial class ProductExpense
    {
        public int productExpenseId { get; set; }
        public int productId { get; set; }
        public int expenseId { get; set; }
        public int createdBy { get; set; }
        public int status { get; set; }
        public DateTime createdAt { get; set; }
        public int modifiedBy { get; set; }
        public DateTime modifiedAt { get; set; }
        public int version { get; set; }
        public string? transactionId { get; set; }

        [ForeignKey("expenseId")]
        public Expense Expense { get; set; }
        public ExpenseValue ExpenseValue { get; set; }
    }
}