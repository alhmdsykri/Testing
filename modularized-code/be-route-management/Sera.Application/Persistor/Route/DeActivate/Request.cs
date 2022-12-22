namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeactivateRouteRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public string action { get; set; }
        public int userId { get; set; }
        public DeactivateRouteModel deactivateRoute { get; set; }
    }

    public class DeactivateRouteModel
    {
        public int routeId { get; set; }
    }
}
