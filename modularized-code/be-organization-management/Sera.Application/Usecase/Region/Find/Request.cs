namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindRegionRequest :
        IRequest<Response<IEnumerable<FindRegionResponse>>>
    {
        public string? regionName { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("regionName")]
        public SortRegion sortBy { get; set; } = SortRegion.regionName;
    }

    public enum SortRegion
    {
        regionName = 1
    }
}
