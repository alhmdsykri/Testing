namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindCustomerContractRequest : IRequest<Response<IEnumerable<FindCustomerContractResponse>>>
    {
        public int customerId { get; set; }
        public string? status { get; set; }
        public DateTime? startDate { get; set; }
        public DateTime? endDate { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;
    }

    public enum SortContract
    {
        contractNumber = 1,
    }
}