
namespace Sera.Application.Persistor
{

    [ExcludeFromCodeCoverage]
    public class UpdateCompletionStatusFromUpdateTripExpenseRequest :
      ServiceBusRequest<UpdateCompletionStatusFromUpdateTripExpenseModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateCompletionStatusFromUpdateTripExpenseModel
    {
        public int routeId { get; set; }
        public int tripExpenseId { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public decimal distance { get; set; }

        public List<UpdateCompletionStatusDetailFromUpdateTripExpenseModel> UpdateCompletionStatusDetailFromUpdateTripExpense { get; set; }

    }

    [ExcludeFromCodeCoverage]
    public class UpdateCompletionStatusDetailFromUpdateTripExpenseModel
    {

        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }

}
