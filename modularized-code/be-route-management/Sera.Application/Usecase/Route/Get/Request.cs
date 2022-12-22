namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteRequest : IRequest<Response<GetRouteResponse>>
    {
        public int routeId { get; set; }
    }
}