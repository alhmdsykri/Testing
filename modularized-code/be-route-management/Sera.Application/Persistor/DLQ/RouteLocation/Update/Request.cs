namespace Sera.Application.Persistor.DLQ
{
    [ExcludeFromCodeCoverage]
    public class RouteLocationDLQUpdateRequest :
        ServiceBusRequest<UpdateRouteLocationModel>, IRequest<IResultStatus>
    { }
}
