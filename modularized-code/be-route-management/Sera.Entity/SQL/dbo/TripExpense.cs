namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("TripExpense", Schema = "dbo")]
    public partial class TripExpense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int tripExpenseId { get; set; }
        public int? productVehicleTypeId { get; set; }
        public int businessUnitId { get; set; }
        public decimal totalExpense { get; set; }
        public int routeId { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string? transactionId { get; set; }

        [ForeignKey("routeId")]
        public Route Route { get; set; }
        public ExpenseValue ExpenseValue { get; set; }
        public Revenue Revenue { get; set; }
        public ProductVehicleType ProductVehicleType { get; set; }
    }
}
