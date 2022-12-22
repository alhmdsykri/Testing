namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindBURequest : IRequest<Response<IEnumerable<FindBUResponse>>>
    {
        public string businessUnitCode { get; set; } = string.Empty;
        public string businessUnitName { get; set; } = string.Empty;
        public string companyCode { get; set; } = string.Empty;
        public string companyName { get; set; } = string.Empty;

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("businessUnitName")]
        public SortBussinesUnit sortBy { get; set; } = SortBussinesUnit.businessUnitName;
    }
    public enum SortBussinesUnit
    {
        businessUnitCode = 1,
        businessUnitName = 2,
        companyCode = 3,
        companyName = 4
    }
}
