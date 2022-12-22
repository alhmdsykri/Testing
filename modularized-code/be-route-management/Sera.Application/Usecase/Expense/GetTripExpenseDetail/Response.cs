namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTripExpenseDetailResponse
    {        
        public int tripExpenseId { get; set; }
        public int productId { get; set; }
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public decimal totalExpense { get; set; }       
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public string uomCode { get; set; }
        public List<ExpenseCategory> expenseCategory { get; set; }
    }

    public class ExpenseCategory
    {
        public int expenseCategoryId { get; set; }
        public decimal values { get; set; }
    }
}