namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVehicleTypeRequest : IRequest<Response<IEnumerable<FindVehicleTypeResponse>>>
    {
        public string? vehicleTypeSearch { get; set; } = string.Empty;

        public SearchVehicleTypeBy vehicleTypeSearchBy { get; set; } = SearchVehicleTypeBy.vehicleTypeName;

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;         
    }

    public enum SearchVehicleTypeBy
    {
        vehicleTypeName = 1,
        vehicleTypeCode = 2
    }
}