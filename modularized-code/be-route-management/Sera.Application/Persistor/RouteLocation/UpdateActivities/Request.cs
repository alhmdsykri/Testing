namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateActivitiesRequest : ServiceBusRequest<UpdateActivitiesModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateActivitiesModel
    {
        public int routeLocationId { get; set; }
        public int routeActionId { get; set; }
        public decimal distanceToNextLocation { get; set; }
    }
}