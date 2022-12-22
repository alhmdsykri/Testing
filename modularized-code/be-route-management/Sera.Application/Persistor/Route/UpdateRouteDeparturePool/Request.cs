namespace Sera.Application.Persistor;

[ExcludeFromCodeCoverage]
public partial class UpdateRouteDeparturePoolBusRequest : ServiceBusRequest<UpdateRouteDeparturePoolModel>, IRequest<IResultStatus>
{
}

[ExcludeFromCodeCoverage]
public class UpdateRouteDeparturePoolModel
{
	public int routeId { get; set; }
	public int departurePoolId { get; set; }
	public string departurePoolCode { get; set; }
	public string departurePoolName { get; set; }
}