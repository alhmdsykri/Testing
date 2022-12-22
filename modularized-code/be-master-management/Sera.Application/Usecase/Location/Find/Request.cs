namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindLocationRequest : IRequest<Response<IEnumerable<FindLocationResponse>>>
    {
        public string? locationCode { get; set; } = string.Empty;
        public string? locationName { get; set; } = string.Empty;
        public string? locationTypeCode { get; set; } = string.Empty;
        public string? locationTypeName { get; set; } = string.Empty;
        public string? branchCode { get; set; } = string.Empty;
        public string? branchName { get; set; } = string.Empty;
        public string? locationAddress { get; set; } = string.Empty;

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("locationName")]
        public SortLocation sortBy { get; set; } = SortLocation.locationName;
    }

    public enum SortLocation
    {
        locationCode = 1,
        locationName = 2,
        locationTypeName = 3,
        branchCode = 4,
        branchName = 5,
        locationAddress = 6,
        locationTypeCode = 7
    }
}