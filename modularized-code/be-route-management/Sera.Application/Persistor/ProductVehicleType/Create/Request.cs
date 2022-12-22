namespace Sera.Application.Persistor
{

    [ExcludeFromCodeCoverage]
    public class CreateProductVehicleTypeRequest : ServiceBusRequest<CreateProductVehicleTypeModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateProductVehicleTypeModel
    {
        public List<ProductVehicleTypeModel> tripExpense { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class ProductVehicleTypeModel
    {
        public int routeId { get; set; }
        public int productVehicleTypeId { get; set; }
        public int? tripExpenseId { get; set; }
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

        public List<ProductVehicleTypeExpenseDetailModel> expenseDetail { get; set; }

    }

    [ExcludeFromCodeCoverage]
    public class ProductVehicleTypeExpenseDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }
}
