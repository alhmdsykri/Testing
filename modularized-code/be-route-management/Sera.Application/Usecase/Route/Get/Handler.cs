namespace Sera.Application.Usecase
{
    public class GetRouteHandler : BaseHandler, IRequestHandler<GetRouteRequest, Response<GetRouteResponse>>
    {
        public GetRouteHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetRouteResponse>> Handle(GetRouteRequest request, CancellationToken cancellationToken)
        {
            Response<GetRouteResponse> response = new();
            var route = await dbContext.Route
                                         .AsNoTracking()
                                         .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) && x.routeId == request.routeId)
                                         .Select(x => new GetRouteResponse()
                                         {
                                             routeId = x.routeId,
                                             routeCode = x.routeCode,
                                             routeName = x.routeName,
                                             customerId = x.customerId,
                                             customerCode = x.customerCode,
                                             customerName = x.customerName,
                                             contractNumber = x.contractNumber,
                                             returnRouteId = x.returnRouteId,
                                             returnRouteCode = x.returnRouteCode,
                                             returnRouteName = x.returnRouteName,
                                             completionStatus = x.completionStatus,
                                             businesUnitId = x.businessUnitId,
                                             lastUpdate = x.lastUpdate,
                                             modifiedDate = x.modifiedAt
                                         }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (route == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Route"), null);
            }

            return response.Success(TransactionId, Message.Found("Route"), route);
        }
    }
}