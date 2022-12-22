namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindCustomerRequest : IRequest<Response<IEnumerable<FindCustomerResponse>>>
    {
        public string? customerName { get; set; } = string.Empty;
        public string? businessUnitCode { get; set; }
        public int? businessUnitId { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("customerName")]
        public SortCustomer sortBy { get; set; } = SortCustomer.customerName;
    }

    public enum SortCustomer
    {
        customerName = 1,
        isBlocked = 2
    }
}