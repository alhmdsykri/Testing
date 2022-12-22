namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class ReactivateRouteRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public string action { get; set; }
        public int userId { get; set; }
        public ReactivateRouteModel reactivateRoute { get; set; }
    }
    public class ReactivateRouteModel
    {
        public int routeId { get; set; }
    }
}
