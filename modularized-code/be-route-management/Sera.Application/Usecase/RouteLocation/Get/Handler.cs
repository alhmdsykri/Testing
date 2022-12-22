namespace Sera.Application.Usecase
{
    public class GetRouteLocationHandler : BaseHandler, IRequestHandler<GetRouteLocationRequest, Response<IEnumerable<GetRouteLocationResponse>>>
    {
        public GetRouteLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetRouteLocationResponse>>> Handle(GetRouteLocationRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetRouteLocationResponse>>();
            IQueryable<SQL.RouteLocation>? query;

            query = dbContext.RouteLocation
                             .AsNoTracking()
                             .Where(x => x.status == (int)EventStatus.COMPLETED);

            if (request.routeId.HasValue)
            {
                query = query.AsNoTracking()
                            .Where(x => x.routeId == request.routeId);
            }

            if (request.locationId.HasValue)
            {
                query = query.AsNoTracking()
                            .Where(x => x.locationId == request.locationId);
            }

            var entity = await query.Select(x => new GetRouteLocationResponse()
            {
                routeLocationId = x.routeLocationId,
                sequenceNumber = x.sequenceNumber,
                locationId = x.locationId,
                locationCode = x.locationCode,
                locationName = x.locationName,
                brancId = x.branchId,
                branchCode = x.branchCode,
                branchName = x.branchName,
                distanceToNextLocation = x.distanceToNextLocation,
                timeZone = x.timezone

            }).ToListAsync();

            entity = entity.OrderBy(x => x.sequenceNumber).ToList();

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Route Location"), null);
            }

            return response.Success(TransactionId, Message.Found("Route Location"), entity);
        }
    }
}