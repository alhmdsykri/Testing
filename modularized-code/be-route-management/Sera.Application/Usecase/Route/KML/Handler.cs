namespace Sera.Application.Usecase
{
    public class GetRouteKMLHandler : BaseHandler,
        IRequestHandler<GetRouteKMLRequest, Response<GetRouteKMLResponse>>
    {
        public GetRouteKMLHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<GetRouteKMLResponse>> Handle(GetRouteKMLRequest request,
            CancellationToken cancellationToken)
        {
            Response<GetRouteKMLResponse> response = new();
            GetRouteKMLResponse data = new();
            string message = Message.Found("Route");

            var entity = await dbContext.Route
                                        .AsNoTracking()
                                        .Include(x => x.RouteLocation)
                                        .Where(x => DRBAC.locations.Contains(x.departurePoolId.Value) &&
                                                    DRBAC.locations.Contains(x.arrivalPoolId.Value) &&
                                                    x.status == (int)EventStatus.COMPLETED &&
                                                    x.routeId == request.routeId)
                                        .FirstOrDefaultAsync(cancellationToken);

            if (entity == null || entity.routeKML == null)
            {
                message = Message.NotFound("route");
                return response.Success(this.TransactionId, message, null);
            }

            data.routeKML = entity.routeKML;

            if (!entity.RouteLocation.IsEmpty())
            {
                data.location = entity.RouteLocation
                                      .Select(x => new LocationKML
                                      {
                                          latitude = x.latitude,
                                          longitude = x.longitude,
                                          name = x.locationName
                                      }).ToList();
            }

            return response.Success(this.TransactionId, message, data);
        }
    }
}