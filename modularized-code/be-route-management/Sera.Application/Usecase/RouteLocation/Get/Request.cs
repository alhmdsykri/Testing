namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteLocationRequest : IRequest<Response<IEnumerable<GetRouteLocationResponse>>>
    {
        public int? routeId { get; set; }
        public int? locationId { get; set; }
    }
}