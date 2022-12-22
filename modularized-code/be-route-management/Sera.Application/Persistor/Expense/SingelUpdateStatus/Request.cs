namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class SingleUpdateTripExpenseStatusRequest :
      ServiceBusRequest<SingelUpdateExpenseStatusModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class SingelUpdateExpenseStatusModel
    {
        public int routeId { get; set; }
        public int productId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public decimal distance { get; set; }
        public List<SingelUpdateExpenseStatusDetailModel> SingelUpdateExpenseStatusDetail { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class SingelUpdateExpenseStatusDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
