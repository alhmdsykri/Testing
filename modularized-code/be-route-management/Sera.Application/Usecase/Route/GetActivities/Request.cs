namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteActivitiesRequest : IRequest<Response<GetRouteActivitiesResponse>>
    {
        public int routeId { get; set; }
    }
}