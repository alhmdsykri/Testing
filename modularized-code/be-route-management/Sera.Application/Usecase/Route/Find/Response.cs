namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindRouteResponse
    {        
        public int routeId { get; set; }
        public int routeCode { get; set; }
        public string routeName { get; set; }
        public int? departurePoolId { get; set; }
        public string? departurePoolCode { get; set; }
        public string? departurePoolName { get; set; }
        public int? returnRouteId { get; set; }
        public int? returnRouteCode { get; set; }
        public string? returnRouteName { get; set; }
        public int? customerId { get; set; }
        public string? customerCode { get; set; }
        public string? customerName { get; set; }
        public string? contractNumber { get; set; }        
        public string? completionStatus { get; set; }
        public string pendingApproval { get; set; }
        public DateTime lastUpdate { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}