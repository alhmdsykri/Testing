namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateCompletionStatusFromRouteLocationRequest : ServiceBusRequest<UpdateCompletionStatusFromRouteLocationModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateCompletionStatusFromRouteLocationModel
    {
        public int routeLocationId { get; set; }
        public int routeActionId { get; set; }
        public decimal distanceToNextLocation { get; set; }
        public int routeId { get; set; }
    }
}