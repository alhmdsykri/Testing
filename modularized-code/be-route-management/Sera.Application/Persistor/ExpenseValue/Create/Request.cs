namespace Sera.Application.Persistor
{

    [ExcludeFromCodeCoverage]
    public class CreateTripExpenseValueRequest :
       ServiceBusRequest<List<CreateExpenseValueModel>>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateExpenseValueModel
    {
        public int productVehicleTypeId { get; set; }
        public int routeId { get; set; }
        public int tripExpenseId { get; set; }
        public int businessUnitId { get; set; }
        public int productId { get; set; }
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public decimal totalExpense { get; set; }
        public decimal revenue { get; set; }
        public decimal COGS { get; set; }
        public string uomCode { get; set; }
        public decimal distance { get; set; }

        public List<ExpenseValueExpenseDetailModel> ExpenseValueExpenseDetail { get; set; }

    }

    [ExcludeFromCodeCoverage]
    public class ExpenseValueExpenseDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
