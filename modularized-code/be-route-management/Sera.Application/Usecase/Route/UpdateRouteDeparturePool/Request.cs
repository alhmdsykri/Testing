namespace Sera.Application.Usecase;

[ExcludeFromCodeCoverage]
public  class UpdateRouteDeparturePoolRequest : IRequest<Response>
{
    public int routeId { get; set; }
    public int departurePoolId { get; set; }
    public string departurePoolCode { get; set; }
    public string departurePoolName { get; set; }
}