namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateTripExpenseRequest : ServiceBusRequest<UpdateExpenseModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateExpenseModel
    {
        public int routeId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public decimal distance { get; set; }

        public List<UpdateExpenseDetailModel> updateTripExpenseDetail { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class UpdateExpenseDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
