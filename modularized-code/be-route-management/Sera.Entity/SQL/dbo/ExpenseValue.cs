namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("ExpenseValue", Schema = "dbo")]
    
    public partial class ExpenseValue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int expenseValueId { get; set; }
        public int? tripExpenseid { get; set; }
        public int expenseId { get; set; }
        public decimal value { get; set; }
        public int? productVehicleTypeId { get; set; }
        public string? referenceNumber { get; set; }
        public string? expenseCalculatedType { get; set; }
        public string? function { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string? transactionId { get; set; }
        public  TripExpense TripExpenses { get; set; }
    }
}
