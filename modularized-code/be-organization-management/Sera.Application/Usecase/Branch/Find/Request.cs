namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindBranchRequest : IRequest<Response<IEnumerable<FindBranchResponse>>>
    {
        public string? branchCode { get; set; } = string.Empty;
        public string? branchName { get; set; } = string.Empty;
        public string? businessUnitCode { get; set; } = string.Empty;
        public string? businessUnitName { get; set; } = string.Empty;
        public string? regionName { get; set; } = string.Empty;

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("branchName")]
        public SortBranch sortBy { get; set; } = SortBranch.branchName;
    }

    public enum SortBranch
    {
        branchCode = 1,
        branchName = 2,
        businessUnitCode = 3,
        businessUnitName = 4,
        regionName = 5
    }
}
