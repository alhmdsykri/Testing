namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateRouteDetailFMSRequest : IRequest<Response>
    {
        public int routeId { get; set; }
        public int? customerId { get; set; }
        public string? customerName { get; set; }
        public string? contractNumber { get; set; }
        public int? returnRouteId { get; set; }
        public string? returnRouteName { get; set; }
    }
}