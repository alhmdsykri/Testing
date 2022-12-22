namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteRouteRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public string action { get; set; }
        public int userId { get; set; }
        public DeleteRouteModel deleteRoute { get; set; }
    }
    public class DeleteRouteModel
    {
        public int routeId { get; set; }
        public int routeCode { get; set; }
        public string routeName { get; set; }
        public int status { get; set; }
    }
}