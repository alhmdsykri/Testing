namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateRevenueRequest :
       ServiceBusRequest<UpdateRevenueModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateRevenueModel : IRequest<Response>
    {
        public int routeId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public decimal distance { get; set; }
        public List<UpdateRevenueDetailModel> UpdateRevenueDetail { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class UpdateRevenueDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
