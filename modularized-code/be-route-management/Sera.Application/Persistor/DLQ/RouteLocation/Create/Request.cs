namespace Sera.Application.Persistor.DLQ
{
    [ExcludeFromCodeCoverage]
    public class RouteLocationDLQCreateRequest :
        ServiceBusRequest<CreateRouteLocationModel>, IRequest<IResultStatus>
    { }
}
