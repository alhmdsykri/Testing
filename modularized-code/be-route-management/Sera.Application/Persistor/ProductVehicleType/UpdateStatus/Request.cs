namespace Sera.Application.Persistor
{

    [ExcludeFromCodeCoverage]
    public class UpdateProductVehicleTypeStatusRequest :
      ServiceBusRequest<List<UpdateProductVehicleTypeStatusModel>>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateProductVehicleTypeStatusModel
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

        public List<UpdateProductVehicleTypeDetailModel> UpdateProductVehicleTypeDetail { get; set; }

    }

    [ExcludeFromCodeCoverage]
    public class UpdateProductVehicleTypeDetailModel
    {
        public int expenseCategoryId { get; set; }
        public decimal value { get; set; }
    }

}
