namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateExpenseValueRequest :
       ServiceBusRequest<UpdateExpenseValueModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateExpenseValueModel
    {
        public int routeId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public decimal distance { get; set; }

        public List<updateExpenseValueExpenseDetailModel> updateExpenseValueExpenseDetail { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class updateExpenseValueExpenseDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
