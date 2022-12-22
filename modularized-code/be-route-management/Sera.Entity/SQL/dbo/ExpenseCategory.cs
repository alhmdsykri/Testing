namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("ExpenseCategory", Schema = "dbo")]
    public partial class ExpenseCategory
    {
        //public ExpenseCategory()
        //{
        //    this.ExpenseValues = new HashSet<ExpenseValue>();
        //}
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int expenseCategoryId { get; set; }
        public int productId { get; set; }
        public int affectedBranchId { get; set; }
        public int expenseId { get; set; }
        public int status { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }

        [ForeignKey("expenseId")]
        public Expense Expense { get; set; }

        public ExpenseValue ExpenseValue { get; set; }
    }
}