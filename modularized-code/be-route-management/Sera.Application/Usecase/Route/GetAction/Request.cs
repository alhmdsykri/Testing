namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteActionRequest : IRequest<Response<IEnumerable<GetRouteActionResponse>>>
    {
        public string prevNextAction { get; set; }
    }
}