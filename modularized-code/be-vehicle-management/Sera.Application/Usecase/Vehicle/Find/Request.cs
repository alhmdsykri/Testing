namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVehicleRequest : IRequest<Response<IEnumerable<FindVehicleResponse>>>
    {
        public int? vehicleTypeId { get; set; }
        public string? licensePlate { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public int? locationId { get; set; }
        public string? locationCode { get; set; }
        public string? locationName { get; set; }
        public string? currentLocationCode { get; set; }
        public string? currentLocationName { get; set; }
        public int? vehicleStatus { get; set; }
        public DateTime? lastUpdate { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("DESC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("lastUpdate")]
        public SortVehicle sortBy { get; set; } = SortVehicle.lastUpdate;
    }
    
    public enum SortVehicle
    {
        lastUpdate = 1,
        LocationName = 2,
        currentLocationName = 3,
        VehicleStatus = 4,
    }
}
