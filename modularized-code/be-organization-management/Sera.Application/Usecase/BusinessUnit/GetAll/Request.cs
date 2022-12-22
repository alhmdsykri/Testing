namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetAllBURequest : IRequest<Response<IEnumerable<GetAllBUResponse>>>
    {
        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("businessUnitName")]
        public SortBussinesUnit sortBy { get; set; } = SortBussinesUnit.businessUnitName;
    }
}