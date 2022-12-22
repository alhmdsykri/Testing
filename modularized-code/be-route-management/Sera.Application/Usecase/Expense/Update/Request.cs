namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateExpenseRequest : IRequest<Response>
    {
        public int routeId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public string uomCode { get; set; }
        public decimal distance { get; set; }
        public List<UpdateTripExpenseDetailModel> UpdateTripExpenseDetail { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class UpdateTripExpenseDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
