namespace Sera.Application.Usecase
{
    public class GetOverviewRouteHandler : BaseHandler,
         IRequestHandler<GetOverviewRouteRequest, Response<GetOverviewRouteResponse>>
    {
        public GetOverviewRouteHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetOverviewRouteResponse>> Handle(
            GetOverviewRouteRequest request, CancellationToken cancellationToken)
        {
            Response<GetOverviewRouteResponse> response = new();

            var data = await dbContext.Route
                                      .AsNoTracking()
                                      .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) && x.status == (int)EventStatus.COMPLETED)
                                      .GroupBy(x => x.completionStatus)
                                      .Select(x => new GetOverviewRouteResponse()
                                      {
                                          totalRoute = x.Count(),
                                          completed = x.Count(x => x.completionStatus == (int)RouteStatus.COMPLETED),
                                          inProgress = x.Count(x => x.completionStatus == (int)RouteStatus.INPROGRESS),
                                          inComplete = x.Count(x => x.completionStatus == (int)RouteStatus.INCOMPLETE),
                                          pendingApproval = x.Count(x => x.completionStatus == (int)RouteStatus.PENDINGAPPROVAL)                                       
                                      })
                                      .ToListAsync(cancellationToken: cancellationToken);
            if (data == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Route"), null);
            }

            data.ForEach(x =>
            {
                x.totalRoute = data.Sum(x => x.totalRoute);
                x.completed = data.Sum(x => x.completed);
                x.inProgress = data.Sum(x => x.inProgress);
                x.inComplete = data.Sum(x => x.inComplete);
                x.pendingApproval = data.Sum(x => x.pendingApproval);
            });

            GetOverviewRouteResponse datum = data.FirstOrDefault();

            return response.Success(TransactionId, Message.Found("Route"), datum);
        }        
    }
}
