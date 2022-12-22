namespace Sera.Application.Usecase
{
    public class GetActionHandler : BaseHandler,
        IRequestHandler<GetRouteActionRequest, Response<IEnumerable<GetRouteActionResponse>>>
    {
        public GetActionHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetRouteActionResponse>>> Handle(GetRouteActionRequest request, CancellationToken cancellationToken)
        {
            Response<IEnumerable<GetRouteActionResponse>> response = new();

            var routeAction = await dbContext.ActionDetail
                                         .AsNoTracking()
                                         .Include(i => i.RouteAction).DefaultIfEmpty()
                                         .Include(j => j.RouteActionDetail).DefaultIfEmpty()
                                         .Where(x => x.status == (int)EventStatus.COMPLETED && 
                                                     x.RouteAction.name == request.prevNextAction)
                                         .Select(x => new GetRouteActionResponse()
                                         {
                                             routeActionId = x.RouteActionDetail.routeActionId,
                                             routeActionName = x.RouteActionDetail.name,
                                         }).ToListAsync(cancellationToken: cancellationToken);

            return response.Success(TransactionId, Message.Found("Route Action"), routeAction);            
        }
    }
}