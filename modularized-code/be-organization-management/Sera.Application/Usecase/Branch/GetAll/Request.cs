namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetAllBranchRequest : IRequest<Response<IEnumerable<GetAllBranchResponse>>>
    {
        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("branchName")]
        public SortBranch sortBy { get; set; } = SortBranch.branchName;
    }
}