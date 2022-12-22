namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindTripExpenseRequest : IRequest<Response<IEnumerable<FindTripExpenseResponse>>>
    {
        public int routeId { get; set; }
        public string? vehicleTypeCode { get; set; }
        public string? vehicleTypeName { get; set; }
        public string? uomCode { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.DESC;

        [DefaultValue("vehicleTypeCode")]
        public SortTripExpense sortBy { get; set; } = SortTripExpense.vehicleTypeCode;

    }
    public enum SortTripExpense
    {
        vehicleTypeCode = 1,
        vehicleTypeName = 2,
        uomCode = 3
    }
}
