namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindRouteRequest : IRequest<Response<IEnumerable<FindRouteResponse>>>
    {
        public string? routeCode { get; set; }
        public string? routeName { get; set; }
        public int? departurePoolId { get; set; }
        public string? departurePoolCode { get; set; }
        public string? departurePoolName { get; set; }        
        public string? customerCode { get; set; }
        public string? customerName { get; set; }
        public string? contractNumber { get; set; }
        public string? returnRouteCode { get; set; }
        public string? returnRouteName { get; set; }
        public int? completionStatus { get; set; }
        public int? arrivalPoolId { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.DESC;

        [DefaultValue("lastUpdate")]
        public SortRoute sortBy { get; set; } = SortRoute.lastUpdate;
    }    
    public enum SortRoute
    {
        customerCode = 1,
        customerName = 2,
        completionStatus = 3,
        lastUpdate = 4
    }
}