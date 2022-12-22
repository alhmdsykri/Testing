namespace Sera.Application.Usecase
{
    public class GetRouteActivitiesHandler : BaseHandler,
        IRequestHandler<GetRouteActivitiesRequest, Response<GetRouteActivitiesResponse>>
    {
        public GetRouteActivitiesHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetRouteActivitiesResponse>> Handle(GetRouteActivitiesRequest request, CancellationToken cancellationToken)
        {
            Response<GetRouteActivitiesResponse> response = new();
            GetRouteActivitiesResponse data = new ();

            var route_activities = await dbContext.RouteLocation
                                         .AsNoTracking()
                                         .Include(i => i.routeAction).DefaultIfEmpty()
                                         .Where(x => DRBAC.branches.Contains(x.branchId.Value) && x.routeId == request.routeId && x.status == (int)EventStatus.COMPLETED)
                                         .OrderBy(x => x.sequenceNumber)
                                         .ToListAsync(cancellationToken: cancellationToken);

            if (route_activities.Count == 0) { return response.Fail(TransactionId, Message.NotFound("Route Activities"), null); }

            data.totalActivity = route_activities.Count();
            data.remainingActivityToComplete = route_activities.Count(x => x.routeActionId == null);
            data.listActivity = route_activities.Select(x => new GetListActivities
            {
                routeLocationId = x.routeLocationId,
                locationCode = x.locationCode,
                locationName = x.locationName,
                branchCode = x.branchCode,
                branchName = x.branchName,
                distanceToNextLocation = x.distanceToNextLocation,
                timeZone = x.timezone,
                routeActionId = x.routeActionId,
                routeActionName = x.routeActionId == null ? null : x.routeAction.name
            }).ToList();            

            return response.Success(TransactionId, Message.Found("Route Activities"), data);            
        }
    }
}