namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindContractsRequest : IRequest<Response<IEnumerable<FindContractsResponse>>>
    {
        public int businessUnitId { get; set; }
        public string? contractNumber { get; set; }
        public string? customerCode { get; set; }
        public string? customerName { get; set; }
        public int? contractStatus { get; set; }
        public DateTime? startDate { get; set; }
        public DateTime? endDate { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;
        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("contractNumber")]
        public SortContracts sortBy { get; set; } = SortContracts.contractNumber;
    }

    public enum SortContracts
    {
        contractNumber = 1,
        customerName = 2
    }
}