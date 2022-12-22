namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVendorRequest : IRequest<Response<IEnumerable<FindVendorResponse>>>
    {
        public string? vendorSearch { get; set; } = string.Empty;

        public SearchVendorBy vendorSearchBy { get; set; } = SearchVendorBy.vendorName;

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;
    }

    public enum SearchVendorBy
    {
        vendorName = 1,
        vendorCode = 2       
    }
}