namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteResponse
    {
        public int routeId { get; set; }
        public int routeCode { get; set; }
        public string routeName { get; set; }
        public int? customerId { get; set; }
        public string? customerCode { get; set; }
        public string? customerName { get; set; }
        public string? contractNumber { get; set; }
        public int? returnRouteId { get; set; }
        public int? returnRouteCode { get; set; }
        public string? returnRouteName { get; set; }
        public int completionStatus { get; set; }
        public int businesUnitId { get; set; }
        public DateTime lastUpdate { get; set; }
        public DateTime? modifiedDate { get; set; }
    }
}
