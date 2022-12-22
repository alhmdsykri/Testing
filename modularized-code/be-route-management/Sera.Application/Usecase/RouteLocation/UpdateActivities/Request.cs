namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateRouteLocationActivitiesRequest : IRequest<Response>
    {
        public int routeLocationId { get; set; }
        public int routeActionId { get; set; }
        public decimal distanceToNextLocation { get; set; }
    }
}