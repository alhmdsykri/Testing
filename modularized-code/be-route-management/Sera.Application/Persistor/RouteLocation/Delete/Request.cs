namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteRouteLocationRequest :
        ServiceBusRequest<DeleteRouteLocationModel>, IRequest<IResultStatus>
    { }

    public class DeleteRouteLocationModel
    {
        public int routeId { get; set; }
        public int routeCode { get; set; }
        public string routeName { get; set; }
        public int status { get; set; }
    }
}