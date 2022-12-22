namespace Sera.Application.Usecase
{
    public class GetLocationByMultipleIdHandler : BaseHandler,
                 IRequestHandler<GetLocationByMultipleIdRequest, Response<GetLocationByMultipleIdResponse>>
    {
        public GetLocationByMultipleIdHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetLocationByMultipleIdResponse>> Handle(
            GetLocationByMultipleIdRequest request, CancellationToken cancellationToken)
        {
            Response<GetLocationByMultipleIdResponse> response = new();

            #region Validation Existing LocationId[]

            var locationData = await dbContext.Location.AsNoTracking()
                                               .Where(x => DRBAC.locations.Contains(x.locationId) &&
                                                      request.locationId.Contains(x.locationId) &&
                                                      x.status == (int)EventStatus.COMPLETED)
                                               .ToListAsync(cancellationToken: cancellationToken);

            var locationId = locationData.Select(x => x.locationId).ToArray();
            var locatinTypeId = locationData.Select(x => x.locationTypeId).ToArray();
            int[] locTypeMandatory = new int[] { (int)LocationType.CUSTOMERLOCATION };

            if (request.locationId.Except(locationId).Any())
            {
                var listLocationId = request.locationId.Except(locationId).ToList();
                return response.Fail(TransactionId, Message.NotExist($"Location Id : {string.Join(",", listLocationId)} or DRBAC Permission"), null);
            }

            if (locatinTypeId.Intersect(locTypeMandatory).Count() <= 0)
            {
                return response.Fail(TransactionId,
                $"Location Type {LocationType.CUSTOMERLOCATION} need to exist in List of Location Data", null);
            }

            #endregion

            var routeWayPoints = await dbContext.Location.AsNoTracking()
                                               .Where(x => request.locationId.Contains(x.locationId))
                                               .Select(s => new RouteWayPoint()
                                               {
                                                   locationId = s.locationId,
                                                   locationName = s.locationName,
                                                   locationCode = s.locationCode,
                                                   locationTypeId = s.locationTypeId,
                                                   branchId = s.branchId,
                                                   branchCode = s.branchCode,
                                                   branchName = s.branchName,
                                                   latitude = s.latitude,
                                                   longitude = s.longitude
                                               }).ToListAsync(cancellationToken: cancellationToken);

            if (routeWayPoints == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Location"), null);
            }

            GetLocationByMultipleIdResponse data = new();
            data.routeWayPoint = routeWayPoints;

            return response.Success(TransactionId, Message.Found("Location"), data);
        }
    }
}