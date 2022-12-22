namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateExpenseRequest : IRequest<Response>
    {
       public List<tripExpenseModel> tripExpense { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class tripExpenseModel
    {
        public int routeId { get; set; }
        public int? businessUnitId { get; set; }
        public int productId { get; set; }
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public string uomCode { get; set; }
        public decimal distance { get; set; }

        public List<expenseDetailModel> expenseDetail { get; set; }

    }

    [ExcludeFromCodeCoverage]
    public class expenseDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
