namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteKMLRequest : IRequest<Response<GetRouteKMLResponse>>
    {
        public int routeId { get; set; }
    }
}