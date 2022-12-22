namespace Sera.Application.Usecase;

[ExcludeFromCodeCoverage]
public class UpdateRouteRouteArrivalPoolRequest : IRequest<Response>
{
    public int routeId { get; set; }
    public int arrivalPoolId { get; set; }
    public string arrivalPoolCode { get; set; }
    public string arrivalPoolName { get; set; }
}