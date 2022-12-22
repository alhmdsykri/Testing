namespace Sera.Application.Persistor;

[ExcludeFromCodeCoverage]
public class UpdateRouteArrivalPoolBusRequest : ServiceBusRequest<UpdateRouteArrivalPoolModel>, IRequest<IResultStatus>
{
}

[ExcludeFromCodeCoverage]
public class UpdateRouteArrivalPoolModel
{
	public int routeId { get; set; }
	public int arrivalPoolId { get; set; }
	public string arrivalPoolCode { get; set; }
	public string arrivalPoolName { get; set; }
}