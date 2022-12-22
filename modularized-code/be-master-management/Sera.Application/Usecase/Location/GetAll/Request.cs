namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetAllLocationRequest : IRequest<Response<IEnumerable<GetAllLocationResponse>>>
    {
        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("locationName")]
        public SortLocation sortBy { get; set; } = SortLocation.locationName;
    }
}